import { config } from "dotenv";
config();
import { ERC20Client, utils, constants } from "../src";
import { parseTokenMeta, sleep, getDeploy } from "./utils";

import {
  Keys,
} from "casper-js-sdk";

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  ERC20_WASM_PATH,
  ERC20_MASTER_KEY_PAIR_PATH,
  ERC20_INSTALL_PAYMENT_AMOUNT,
  ERC20_CONTRACT_NAME,
  ERC20_TOKEN_NAME,
  ERC20_TOKEN_SYMBOL,
  ERC20_DECIMALS,
  ERC20_TOTAL_SUPPLY
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${ERC20_MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${ERC20_MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const test = async () => {
  const erc20 = new ERC20Client(
    NODE_ADDRESS!,
    CHAIN_NAME!,
    EVENT_STREAM_ADDRESS!
  );

  const installDeployHash = await erc20.install(
    KEYS,
    ERC20_TOKEN_NAME!,
    ERC20_TOKEN_SYMBOL!,
    ERC20_DECIMALS!,
    ERC20_TOTAL_SUPPLY!,
    ERC20_CONTRACT_NAME!,
    ERC20_INSTALL_PAYMENT_AMOUNT!,
    ERC20_WASM_PATH!
  );

  console.log(`... Contract installation deployHash: ${installDeployHash}`);

  await getDeploy(NODE_ADDRESS!, installDeployHash);

  console.log(`... Contract installed successfully.`);

  let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

  console.log(`... Account Info: `);
  console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = await utils.getAccountNamedKeyValue(
    accountInfo,
    `${ERC20_CONTRACT_NAME!}_contract_hash`
  );

  console.log(`... Contract Hash: ${contractHash}`);

  const packageHash = await utils.getAccountNamedKeyValue(
    accountInfo,
    `${ERC20_CONTRACT_NAME!}_package_hash`
  );

  console.log(`... Contract Hash: ${packageHash}`);
};

//test();
