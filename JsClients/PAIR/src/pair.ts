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
import { PAIREvents } from "./constants";
import * as utils from "./utils";
import { RecipientType, IPendingDeploy } from "./types";

class PAIRClient {
  private contractName: string = "pair";
  private contractHash: string= "pair";
  private contractPackageHash: string= "pair";
  private namedKeys: {
    balances: string;
    metadata: string;
    nonces: string;
    allowances: string;
    ownedTokens: string;
    owners: string;
    paused: string;
  };
  private isListening = false;
  private pendingDeploys: IPendingDeploy[] = [];

  constructor(
    private nodeAddress: string,
    private chainName: string,
    private eventStreamAddress?: string
  ) {
    this.namedKeys= {
      balances:"null",
      metadata: "null",
      nonces: "null",
      allowances: "null",
      ownedTokens: "null",
      owners: "null",
      paused: "null"
    }; 
   }

  public async install(
    keys: Keys.AsymmetricKey,
    contractName: string,
    tokenName: string,
    tokenSymbol: string,
    decimals: string,
    totalSupply: string,
    factoryContractHash: String,
    calleeContractHash: String,
    paymentAmount: string,
    wasmPath: string
  ) {

    // convert string addresses to 8 bits hex arrays
    const _factoryContractHash = new CLByteArray(Uint8Array.from(Buffer.from(factoryContractHash, 'hex')));
    const _calleeContractHash = new CLByteArray(Uint8Array.from(Buffer.from(calleeContractHash, 'hex')));

    // const runtimeArgs = RuntimeArgs.fromMap({
    //   contract_name: CLValueBuilder.string(contractName),
    //   factory_hash: CLValueBuilder.key(_factoryContractHash),
    //   callee_contract_hash:  CLValueBuilder.key(_calleeContractHash),
    // });

    const runtimeArgs = RuntimeArgs.fromMap({
      contract_name: CLValueBuilder.string(contractName),
      name: CLValueBuilder.string(tokenName),
      symbol: CLValueBuilder.string(tokenSymbol),
      decimals: CLValueBuilder.u8(decimals),
      initial_supply: CLValueBuilder.u256(totalSupply),
      factory_hash: CLValueBuilder.key(_factoryContractHash),
      callee_contract_hash: CLValueBuilder.key(_calleeContractHash),
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
    const LIST_OF_NAMED_KEYS = [
      'balances',
      'nonces',
      'allowances',
      `${this.contractName}_package_hash`,
      `${this.contractName}_package_hash_wrapped`,
      `${this.contractName}_contract_hash`,
      `${this.contractName}_contract_hash_wrapped`,
      `${this.contractName}_package_access_token`,
    ];
    // @ts-ignore
    this.namedKeys = namedKeys.reduce((acc, val) => {
      if (LIST_OF_NAMED_KEYS.includes(val.name)) {
        return { ...acc, [utils.camelCased(val.name)]: val.key };
      }
      return acc;
    }, {});
  }

  public async name() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["name"]
    );
    return result.value();
  }

  public async symbol() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["symbol"]
    );
    return result.value();
  }

  public async decimal() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["decimals"]
    );
    return result.value();
  }

  public async balanceOf(accountHash: string) {
    //const accountHash = Buffer.from(account.toAccountHash()).toString("hex");
    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      accountHash,
      this.namedKeys.balances
    );
    const maybeValue = result.value().unwrap();
    return maybeValue.value().toString();
  }


  public async nonce(account: CLPublicKey) {
    const accountHash = Buffer.from(account.toAccountHash()).toString("hex");
    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      accountHash,
      this.namedKeys.nonces
    );
    const maybeValue = result.value().unwrap();
    return maybeValue.value().toString();
  }

  public async allowance(owner: CLPublicKey, spender: CLPublicKey) {
    const ownerAccountHash = Buffer.from(owner.toAccountHash()).toString("hex");
    const spenderAccountHash = Buffer.from(spender.toAccountHash()).toString("hex");
    const accountHash: string = `${ownerAccountHash}_${spenderAccountHash}`;
    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      accountHash,
      this.namedKeys.allowances
    );
    const maybeValue = result.value().unwrap();
    return maybeValue.value().toString();
  }


  public async totalSupply() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["total_supply"]
    );
    return result.value();
  }
  public async treasuryFee() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["treasury_fee"]
    );
    return result.value();
  }
  public async token0() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["token0"]
    );
    return result.value();
  }
  public async token1() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["token1"]
    );
    return result.value();
  }
  public async approve(
    keys: Keys.AsymmetricKey,
    spender: RecipientType,
    amount: string,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      spender: utils.createRecipientAddress(spender),
      amount: CLValueBuilder.u256(amount)
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "approve",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(PAIREvents.Approval, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async transfer(
    keys: Keys.AsymmetricKey,
    recipient: RecipientType,
    amount: string,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: utils.createRecipientAddress(recipient),
      amount: CLValueBuilder.u256(amount)
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "transfer",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(PAIREvents.Transfer, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async transferFrom(
    keys: Keys.AsymmetricKey,
    owner: RecipientType,
    recipient: RecipientType,
    amount: string,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      owner: utils.createRecipientAddress(owner),
      recipient: utils.createRecipientAddress(recipient),
      amount: CLValueBuilder.u256(amount)
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "transfer_from",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(PAIREvents.Transfer, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async mint(
    keys: Keys.AsymmetricKey,
    to: string,
    paymentAmount: string
  ) {

    const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, 'hex')));
    const runtimeArgs = RuntimeArgs.fromMap({
      to: CLValueBuilder.key(_to),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "mint_js_client",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(PAIREvents.Sync, deployHash);
      this.addPendingDeploy(PAIREvents.Mint, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async burn(
    keys: Keys.AsymmetricKey,
    to: RecipientType,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      to: utils.createRecipientAddress(to),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "burn_js_client",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(PAIREvents.Sync, deployHash);
      this.addPendingDeploy(PAIREvents.Burn, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async permit(
    keys: Keys.AsymmetricKey,
    publicKey: string,
    signature: string,
    owner: RecipientType,
    spender: RecipientType,
    amount: string,
    deadline: string,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      public: CLValueBuilder.string(publicKey),
      signature: CLValueBuilder.string(signature),
      owner: utils.createRecipientAddress(owner),
      spender: utils.createRecipientAddress(spender),
      value: CLValueBuilder.u256(amount),
      deadline: CLValueBuilder.u64(deadline)
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "permit",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(PAIREvents.Approval, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async skim(
    keys: Keys.AsymmetricKey,
    to: RecipientType,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      to: utils.createRecipientAddress(to),
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "skim",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async erc20Mint_router(
    keys: Keys.AsymmetricKey,
    to: RecipientType,
    amount: string,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      to:utils.createRecipientAddress(to),
      amount: CLValueBuilder.u256(amount),
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "erc20_mint",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(PAIREvents.Transfer, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async erc20Mint(
    keys: Keys.AsymmetricKey,
    to: String,
    amount: string,
    paymentAmount: string
  ) {

    const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, 'hex')));
    const runtimeArgs = RuntimeArgs.fromMap({
      to: CLValueBuilder.key(_to),
      amount: CLValueBuilder.u256(amount),
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "erc20_mint",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(PAIREvents.Transfer, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async sync(
    keys: Keys.AsymmetricKey,
    to: RecipientType,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      to: utils.createRecipientAddress(to),
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "sync",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(PAIREvents.Sync, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async swap(
    keys: Keys.AsymmetricKey,
    amount0_out: string,
    amount1_out: string,
    to: RecipientType,
    data: string,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      amount0_out: CLValueBuilder.u256(amount0_out),
      amount1_out: CLValueBuilder.u256(amount1_out),
      to: utils.createRecipientAddress(to),
      data: CLValueBuilder.string(data)
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "swap",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(PAIREvents.Sync, deployHash);
      this.addPendingDeploy(PAIREvents.Swap, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async initialize(
    keys: Keys.AsymmetricKey,
    token0: String,
    token1: String,
    factory_hash: String,
    paymentAmount: string
  ) {

    const _token0 = new CLByteArray(Uint8Array.from(Buffer.from(token0, 'hex')));
    const _token1 = new CLByteArray(Uint8Array.from(Buffer.from(token1, 'hex')));
    const _factory_hash = new CLByteArray(Uint8Array.from(Buffer.from(factory_hash, 'hex')));

    const runtimeArgs = RuntimeArgs.fromMap({
      token0: CLValueBuilder.key(_token0),
      token1: CLValueBuilder.key(_token1),
      factory_hash: CLValueBuilder.key(_factory_hash),
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "initialize",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async erc20MintMethod(
    keys: Keys.AsymmetricKey,
    erc20: string,
    amount: string,
    paymentAmount: string
  ) {

    const _to = new CLByteArray(Uint8Array.from(Buffer.from(this.contractPackageHash, 'hex')));
    const runtimeArgs = RuntimeArgs.fromMap({
      to: CLValueBuilder.key(_to),
      amount: CLValueBuilder.u256(amount),
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: erc20,
      entryPoint: "mint",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      this.addPendingDeploy(PAIREvents.Transfer, deployHash);
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public async setTreasuryFeePercent(
    keys: Keys.AsymmetricKey,
    amount: string,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      treasury_fee: CLValueBuilder.u256(amount),
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "set_treasury_fee_percent",
      keys,
      nodeAddress: this.nodeAddress,
      paymentAmount,
      runtimeArgs,
    });

    if (deployHash !== null) {
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }



  public onEvent(
    eventNames: PAIREvents[],
    callback: (
      eventName: PAIREvents,
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

        const PAIREvents = transforms.reduce((acc: any, val: any) => {
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
              ){
                acc = [...acc, { name: event.value(), clValue }];
              }
            }
          }
          return acc;
        }, []);

        PAIREvents.forEach((d: any) =>
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

  private addPendingDeploy(deployType: PAIREvents, deployHash: string) {
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

const toCLMap = (map: Map<string, string>) => {
  const clMap = CLValueBuilder.map([
    CLTypeBuilder.string(),
    CLTypeBuilder.string(),
  ]);
  for (const [key, value] of Array.from(map.entries())) {
    clMap.set(CLValueBuilder.string(key), CLValueBuilder.string(value));
  }
  return clMap;
};

const fromCLMap = (map: Map<CLString, CLString>) => {
  const jsMap = new Map();
  for (const [key, value] of Array.from(map.entries())) {
    jsMap.set(key.value(), value.value());
  }
  return jsMap;
};

export default PAIRClient;
