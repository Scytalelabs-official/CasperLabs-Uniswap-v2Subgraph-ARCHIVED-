import { config } from "dotenv";
config();
import { PAIRClient, utils, constants } from "../src";
import { parseTokenMeta, sleep, getDeploy } from "./utils";

import {
  Keys,
} from "casper-js-sdk";

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  PAIR_WASM_PATH,
  PAIR_MASTER_KEY_PAIR_PATH,
  PAIR_INSTALL_PAYMENT_AMOUNT,
  PAIR_TOKEN_NAME,
  PAIR_TOKEN_SYMBOL,
  PAIR_DECIMALS,
  PAIR_TOTAL_SUPPLY,
  FACTORY_CONTRACT_PACKAGE,
  CALLEE_PACKAGE,
  PAIR_CONTRACT_NAME,
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${PAIR_MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${PAIR_MASTER_KEY_PAIR_PATH}/secret_key.pem`
);
const pair = new PAIRClient(
  NODE_ADDRESS!,
  CHAIN_NAME!,
  EVENT_STREAM_ADDRESS!
);

const test = async () => {
  

  const installDeployHash = await pair.install(
    KEYS,
    PAIR_CONTRACT_NAME!,
    PAIR_TOKEN_NAME!,
    PAIR_TOKEN_SYMBOL!,
    PAIR_DECIMALS!,
    PAIR_TOTAL_SUPPLY!,
    FACTORY_CONTRACT_PACKAGE!,
    CALLEE_PACKAGE!,
    // KEYS.publicKey,
    // KEYS.publicKey,
    PAIR_INSTALL_PAYMENT_AMOUNT!,
    PAIR_WASM_PATH!
  );

  console.log(`... Contract installation deployHash: ${installDeployHash}`);

  await getDeploy(NODE_ADDRESS!, installDeployHash);

  console.log(`... Contract installed successfully.`);

  let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

  console.log(`... Account Info: `);
  console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = await utils.getAccountNamedKeyValue(
    accountInfo,
    `${PAIR_CONTRACT_NAME!}_contract_hash`
  );

  const packageHash = await utils.getAccountNamedKeyValue(
    accountInfo,
    `${PAIR_CONTRACT_NAME!}_package_hash`
  );

  console.log(`... Contract Hash: ${contractHash}`);
  console.log(`... Package Hash: ${packageHash}`);
 
};

export const makedeploypaircontract = async (
	FACTORY_CONTRACT_PACKAGE: string,
	CALLEE_PACKAGE: string,
	signerkey:string,
) => {
	
	const deployJSON = await pair.makedeployJSON(
		signerkey,
    PAIR_CONTRACT_NAME!,
    PAIR_TOKEN_NAME!,
    PAIR_TOKEN_SYMBOL!,
    PAIR_DECIMALS!,
    PAIR_TOTAL_SUPPLY!,
    FACTORY_CONTRACT_PACKAGE!,
    CALLEE_PACKAGE!,
    PAIR_INSTALL_PAYMENT_AMOUNT!,
    PAIR_WASM_PATH!
	);

	console.log(`... Contract make deploy SuccessFull: ${deployJSON}`);
	return deployJSON;
  
};

//test();
