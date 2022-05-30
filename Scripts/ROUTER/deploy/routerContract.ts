import { config } from "dotenv";
config();
import { UniswapRouterClient, utils} from "../../../JsClients/ROUTER/src";
import { getDeploy } from "./utils";

import {
  CLValueBuilder,
  Keys,
  CLPublicKey,
  CLPublicKeyType,
} from "casper-js-sdk";

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  WASM_PATH,
  MASTER_KEY_PAIR_PATH,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  FACTORY_CONTRACT_PACKAGE,
  WCSPR_PACKAGE,
  LIBRARY_PACKAGE,
  CONTRACT_NAME,
  ROUTER_CONTRACT_HASH,
  INSTALL_PAYMENT_AMOUNT,
  MINT_ONE_PAYMENT_AMOUNT,
  MINT_COPIES_PAYMENT_AMOUNT,
  BURN_ONE_PAYMENT_AMOUNT,
  MINT_ONE_META_SIZE,
  MINT_COPIES_META_SIZE,
  MINT_COPIES_COUNT,
  MINT_MANY_META_SIZE,
  MINT_MANY_META_COUNT,

  // LIQUIDITY
  TOKEN_A,
  TOKEN_B,
  AMOUNT_A_DESIRED,
  AMOUNT_B_DESIRED,
  AMOUNT_A_MIN,
  AMOUNT_B_MIN,
  TO,
  DEADLINE
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${MASTER_KEY_PAIR_PATH}public_key.pem`,
  `${MASTER_KEY_PAIR_PATH}secret_key.pem`
);

const deploy = async () => {

  const uniswapRouter = new UniswapRouterClient(
    NODE_ADDRESS!,
    CHAIN_NAME!,
    EVENT_STREAM_ADDRESS!
  );

  const installDeployHash = await uniswapRouter.install(
    KEYS,
    FACTORY_CONTRACT_PACKAGE!,
    WCSPR_PACKAGE!,
    LIBRARY_PACKAGE!,
    CONTRACT_NAME!,
    INSTALL_PAYMENT_AMOUNT!,
    WASM_PATH!
  );

  console.log("Passed Parameters: \nfactory: \t", FACTORY_CONTRACT_PACKAGE,
  "\nwcspr: \t", WCSPR_PACKAGE,
  "\nlibrary: \t", LIBRARY_PACKAGE,
  "\ncontract_name: \t", CONTRACT_NAME, "\n");

  console.log(`... Contract installation deployHash: ${installDeployHash}\n`);

  await getDeploy(NODE_ADDRESS!, installDeployHash);

  console.log(`... Contract installed successfully.`);
  
  let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);
  console.log(`... Account Info: `);
  console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = await utils.getAccountNamedKeyValue(
    accountInfo,
    `${CONTRACT_NAME!}_contract_hash`
  );

  console.log(`... Contract Hash: ${contractHash}`);

  const packageHash = await utils.getAccountNamedKeyValue(
    accountInfo,
    `${CONTRACT_NAME!}_package_hash`
  );

  console.log(`... Package Hash: ${packageHash}`);
};

//deploy();
