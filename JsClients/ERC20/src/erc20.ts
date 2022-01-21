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
import { Some, None } from "ts-results";
import * as blake from "blakejs";
import { concat } from "@ethersproject/bytes";
import { ERC20Events } from "./constants";
import * as utils from "./utils";
import { RecipientType, IPendingDeploy } from "./types";
import {createRecipientAddress } from "./utils";

class ERC20Client {
  private contractName: string = "erc20";
  private contractHash: string= "erc20";
  private contractPackageHash: string= "erc20";
  private namedKeys: {
    balances:string
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
    private eventStreamAddress?: string,
    
  ) 
  {
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
    tokenName: string,
    tokenSymbol: string,
    decimals: string,
    totalSupply: string,
    contractName: string,
    paymentAmount: string,
    wasmPath: string
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      name: CLValueBuilder.string(tokenName),
      symbol: CLValueBuilder.string(tokenSymbol),
      decimals: CLValueBuilder.u8(decimals),
      initial_supply: CLValueBuilder.u256(totalSupply),
      contract_name: CLValueBuilder.string(contractName),
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
  public async balanceOf(account: string) {
    try {
      
      const result = await utils.contractDictionaryGetter(
        this.nodeAddress,
        account,
        this.namedKeys.balances
      );
      const maybeValue = result.value().unwrap();
      return maybeValue.value().toString();

    } catch (error) {
      return "0";
    }
    
  }
  public async balanceOfcontract(accountHash: string) {

    try {
      
      const result = await utils.contractDictionaryGetter(
        this.nodeAddress,
        accountHash,
        this.namedKeys.balances
      );
      const maybeValue = result.value().unwrap();
      return maybeValue.value().toString();

    } catch (error) {
      return "0";
    }
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

  public async allowance(owner:string, spender:string) {
    try {
      const _spender = new CLByteArray(
        Uint8Array.from(Buffer.from(spender, "hex"))
      );

      const keyOwner=new CLKey(new CLAccountHash(Uint8Array.from(Buffer.from(owner, "hex"))));
      const keySpender = createRecipientAddress(_spender);
      const finalBytes = concat([CLValueParsers.toBytes(keyOwner).unwrap(), CLValueParsers.toBytes(keySpender).unwrap()]);
      const blaked = blake.blake2b(finalBytes, undefined, 32);
      const encodedBytes = Buffer.from(blaked).toString("hex");

      const result = await utils.contractDictionaryGetter(
        this.nodeAddress,
        encodedBytes,
        this.namedKeys.allowances
      );

      const maybeValue = result.value().unwrap();
      return maybeValue.value().toString();
    } catch (error) {
      return "0";
    }

  }
  
  public async totalSupply() {
    const result = await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash,
      ["total_supply"]
    );
    return result.value();
  }

  public async approve(
    keys: Keys.AsymmetricKey,
    spender: string,
    amount: string,
    paymentAmount: string
  ) {

    const _spender = new CLByteArray(
			Uint8Array.from(Buffer.from(spender, "hex"))
		);
    const runtimeArgs = RuntimeArgs.fromMap({
      spender: utils.createRecipientAddress(_spender),
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
      
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }
  public async mint(
    keys: Keys.AsymmetricKey,
    to: RecipientType,
    amount: string,
    paymentAmount: string
  ) {
    
    const runtimeArgs = RuntimeArgs.fromMap({
      to:utils.createRecipientAddress(to),
      amount: CLValueBuilder.u256(amount)
    });

    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "mint",
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
  // public async mint(
  //   keys: Keys.AsymmetricKey,
  //   to: string,
  //   amount: string,
  //   paymentAmount: string
  // ) {
  //   const tobytearray = new CLByteArray(Uint8Array.from(Buffer.from(to, 'hex')));
  //   const runtimeArgs = RuntimeArgs.fromMap({
  //     to: CLValueBuilder.key(tobytearray),
  //     amount: CLValueBuilder.u256(amount)
  //   });


  //   const deployHash = await contractCall({
  //     chainName: this.chainName,
  //     contractHash: this.contractHash,
  //     entryPoint: "mint",
  //     keys,
  //     nodeAddress: this.nodeAddress,
  //     paymentAmount,
  //     runtimeArgs,
  //   });

  //   if (deployHash !== null) {
 
  //     return deployHash;
  //   } else {
  //     throw Error("Invalid Deploy");
  //   }
  // }
  public async burn(
    keys: Keys.AsymmetricKey,
    from: RecipientType,
    amount: string,
    paymentAmount: string
  ) {

    const runtimeArgs = RuntimeArgs.fromMap({
      from: utils.createRecipientAddress(from),
      amount: CLValueBuilder.u256(amount)
    });


    const deployHash = await contractCall({
      chainName: this.chainName,
      contractHash: this.contractHash,
      entryPoint: "burn",
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
      
      return deployHash;
    } else {
      throw Error("Invalid Deploy");
    }
  }

  public onEvent(
    eventNames: ERC20Events[],
    callback: (
      eventName: ERC20Events,
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

        const ERC20Events = transforms.reduce((acc: any, val: any) => {
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

        ERC20Events.forEach((d: any) =>
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

  public addPendingDeploy(deployType: ERC20Events, deployHash: string) {
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

export default ERC20Client;
