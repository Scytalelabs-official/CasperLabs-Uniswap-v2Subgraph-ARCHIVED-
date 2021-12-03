import {
  CasperClient,
  CLPublicKey,
  CLAccountHash,
  CLByteArray,
  CLKey,
  CLString,
  CLTypeBuilder,
  CLValue,
  CLValueBuilder,
  CLValueParsers,
  CLMap,
  DeployUtil,
  EventName,
  EventStream,
  Keys,
  RuntimeArgs,
} from "casper-js-sdk";
import { FACTORYEvents } from "./constants";
import * as utils from "./utils";
import { RecipientType, IPendingDeploy } from "./types";

class FACTORYClient {
  private contractHash: string="factory";
  private contractPackageHash: string="factory";

  private isListening = false;
  private pendingDeploys: IPendingDeploy[] = [];

  constructor(
    private nodeAddress: string,
    private chainName: string,
    private eventStreamAddress?: string
  ) { }

  public async install(
    keys: Keys.AsymmetricKey,
    contractName: string,
    // feeTo: RecipientType,
    feeToSetter: RecipientType,
    paymentAmount: string,
    wasmPath: string
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      contract_name: CLValueBuilder.string(contractName),
      // fee_to: utils.createRecipientAddress(feeTo),
      fee_to_setter: utils.createRecipientAddress(feeToSetter),

    });

    const deployHash = await installWasmFile({
      chainName: this.chainName,
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys,
      pathToContract: wasmPath,
      runtimeArgs,
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Problem with installation");
    }
  }

  public async setContractHash(hash: string) {
    const stateRootHash = await utils.getStateRootHash(this.nodeAddress);
    const contractData = await utils.getContractData(
      this.nodeAddress,
      stateRootHash,
      hash
    );

    const { contractPackageHash, namedKeys } = contractData.Contract!;
    this.contractHash = hash;
    this.contractPackageHash = contractPackageHash.replace(
      "contract-package-wasm",
      ""
    );

  }

  public async feeTo() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["fee_to"]
    );
    return result.value().toString();
  }

  public async feeToSetter() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["fee_to_setter"]
    );
    return result.value().toString();
  }

  public async allPairs() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["all_pairs"]
    );
    return result.value();
  }

  public async allPairsLength() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["all_pairs_length"]
    );
    return result.value();
  }

  public async getPair(tokenA: String, tokenB: String) {

    const tokenAContractHash = new CLByteArray(Uint8Array.from(Buffer.from(tokenA, 'hex')));
    const tokenBContractHash = new CLByteArray(Uint8Array.from(Buffer.from(tokenB, 'hex')));

    const ContractHash: string = `${tokenAContractHash}_${tokenBContractHash}`;

    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      ContractHash,
      "get_pair"
    );
    const maybeValue = result.value().unwrap();
    return maybeValue.value().toString();
  }

  public async setFeeTo(
    keys: Keys.AsymmetricKey,
    feeTo: RecipientType,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      fee_to: utils.createRecipientAddress(feeTo),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "set_fee_to",
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys: keys,
      runtimeArgs,
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async setFeeToSetter(
    keys: Keys.AsymmetricKey,
    feeToSetter: RecipientType,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      fee_to_setter: utils.createRecipientAddress(feeToSetter),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "set_fee_to_setter",
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys: keys,
      runtimeArgs,
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async createPair(
    keys: Keys.AsymmetricKey,
    tokenA: String,
    tokenB: String,
    pairContract: String,
    paymentAmount: string
  ) {
    const tokenAContractHash = new CLByteArray(Uint8Array.from(Buffer.from(tokenA, 'hex')));
    const tokenBContractHash = new CLByteArray(Uint8Array.from(Buffer.from(tokenB, 'hex')));
    const pairContractHash = new CLByteArray(Uint8Array.from(Buffer.from(pairContract, 'hex')));


    const runtimeArgs = RuntimeArgs.fromMap({
      token_a: CLValueBuilder.key(tokenAContractHash),
      token_b: CLValueBuilder.key(tokenBContractHash),
      pair_hash: CLValueBuilder.key(pairContractHash),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "create_pair",
      paymentAmount,
      nodeAddress: this.nodeAddress,
      keys: keys,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(FACTORYEvents.PairCreated, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public onEvent(
    eventNames: FACTORYEvents[],
    callback: (
      eventName: FACTORYEvents,
      deployStatus: {
        deployHash: string;
        success: boolean;
        error: string | null;
      },
      result: any | null
    ) => void
  ): any {
    if (!this.eventStreamAddress) {
      throw Error("Please set eventStreamAddress before!");
    }
    if (this.isListening) {
      throw Error(
        "Only one event listener can be create at a time. Remove the previous one and start new."
      );
    }
    const es = new EventStream(this.eventStreamAddress);
    this.isListening = true;

    es.subscribe(EventName.DeployProcessed, (value: any) => {
      const deployHash = value.body.DeployProcessed.deploy_hash;

      const pendingDeploy = this.pendingDeploys.find(
        (pending) => pending.deployHash === deployHash
      );

      if (!pendingDeploy) {
        return;
      }

      if (
        !value.body.DeployProcessed.execution_result.Success &&
        value.body.DeployProcessed.execution_result.Failure
      ) {
        callback(
          pendingDeploy.deployType,
          {
            deployHash,
            error:
              value.body.DeployProcessed.execution_result.Failure.error_message,
            success: false,
          },
          null
        );
      } else {
        const { transforms } =
          value.body.DeployProcessed.execution_result.Success.effect;

        const factoryEvents = transforms.reduce((acc: any, val: any) => {
          if (
            val.transform.hasOwnProperty("WriteCLValue") &&
            typeof val.transform.WriteCLValue.parsed === "object" &&
            val.transform.WriteCLValue.parsed !== null
          ) {
            const maybeCLValue = CLValueParsers.fromJSON(
              val.transform.WriteCLValue
            );
            const clValue = maybeCLValue.unwrap();
            if (clValue && clValue instanceof CLMap) {
              const hash = clValue.get(
                CLValueBuilder.string("contract_package_hash")
              );
              const event = clValue.get(CLValueBuilder.string("event_type"));
              if (
                hash &&
                // NOTE: Calling toLowerCase() because current JS-SDK doesn't support checksumed hashes and returns all lower case value
                // Remove it after updating SDK
                hash.value() === this.contractPackageHash.toLowerCase() &&
                event &&
                eventNames.includes(event.value())
              ) {
                acc = [...acc, { name: event.value(), clValue }];
              }
            }
          }
          return acc;
        }, []);

        factoryEvents.forEach((d: any) =>
          callback(
            d.name,
            { deployHash, error: null, success: true },
            d.clValue
          )
        );
      }

      this.pendingDeploys = this.pendingDeploys.filter(
        (pending) => pending.deployHash !== deployHash
      );
    });
    es.start();

    return {
      stopListening: () => {
        es.unsubscribe(EventName.DeployProcessed);
        es.stop();
        this.isListening = false;
        this.pendingDeploys = [];
      },
    };
  }

  private addPendingDeploy(deployType: FACTORYEvents, deployHash: string) {
    this.pendingDeploys = [...this.pendingDeploys, { deployHash, deployType }];
  }
}

interface IInstallParams {
  nodeAddress: string;
  keys: Keys.AsymmetricKey;
  chainName: string;
  pathToContract: string;
  runtimeArgs: RuntimeArgs;
  paymentAmount: string;
}

const installWasmFile = async ({
  nodeAddress,
  keys,
  chainName,
  pathToContract,
  runtimeArgs,
  paymentAmount,
}: IInstallParams): Promise<string> => {
  const client = new CasperClient(nodeAddress);

  // Set contract installation deploy (unsigned).
  let deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(
      CLPublicKey.fromHex(keys.publicKey.toHex()),
      chainName
    ),
    DeployUtil.ExecutableDeployItem.newModuleBytes(
      utils.getBinary(pathToContract),
      runtimeArgs
    ),
    DeployUtil.standardPayment(paymentAmount)
  );

  // Sign deploy.
  deploy = client.signDeploy(deploy, keys);

  // Dispatch deploy to node.
  return await client.putDeploy(deploy);
};

interface IContractCallParams {
  nodeAddress: string;
  keys: Keys.AsymmetricKey;
  chainName: string;
  entryPoint: string;
  runtimeArgs: RuntimeArgs;
  paymentAmount: string;
  contractHash: string;
}

const contractCall = async ({
  nodeAddress,
  keys,
  chainName,
  contractHash,
  entryPoint,
  runtimeArgs,
  paymentAmount,
}: IContractCallParams) => {
  const client = new CasperClient(nodeAddress);
  const contractHashAsByteArray = utils.contractHashToByteArray(contractHash);

  let deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(keys.publicKey, chainName),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      contractHashAsByteArray,
      entryPoint,
      runtimeArgs
    ),
    DeployUtil.standardPayment(paymentAmount)
  );

  // Sign deploy.
  deploy = client.signDeploy(deploy, keys);

  // Dispatch deploy to node.
  const deployHash = await client.putDeploy(deploy);

  return deployHash;
};

const contractSimpleGetter = async (
  nodeAddress: string,
  contractHash: string,
  key: string[]
) => {
  const stateRootHash = await utils.getStateRootHash(nodeAddress);
  const clValue = await utils.getContractData(
    nodeAddress,
    stateRootHash,
    contractHash,
    key
  );

  if (clValue && clValue.CLValue instanceof CLValue) {
    return clValue.CLValue!;
  } else {
    throw Error("Invalid stored value");
  }
};



export default FACTORYClient;
