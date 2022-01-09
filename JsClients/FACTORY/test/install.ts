import { config } from "dotenv";
config();
import { FACTORYClient, utils, constants } from "../src";
import { parseTokenMeta, sleep, getDeploy } from "./utils";

import {
  Keys,
} from "casper-js-sdk";

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  FACTORY_WASM_PATH,
  FACTORY_MASTER_KEY_PAIR_PATH,
  FACTORY_INSTALL_PAYMENT_AMOUNT,
  FACTORY_CONTRACT_NAME
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${FACTORY_MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${FACTORY_MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const test = async () => {
  const factory = new FACTORYClient(
    NODE_ADDRESS!,
    CHAIN_NAME!,
    EVENT_STREAM_ADDRESS!
  );

  // const installDeployHash = await factory.install(
  //   KEYS,
  //   FACTORY_CONTRACT_NAME!,
  //   KEYS.publicKey!,
  //   // KEYS.publicKey,
  //   FACTORY_INSTALL_PAYMENT_AMOUNT!,
  //   FACTORY_WASM_PATH!
  // );

  // console.log(`... Contract installation deployHash: ${installDeployHash}`);

  // await getDeploy(NODE_ADDRESS!, installDeployHash);

  // console.log(`... Contract installed successfully.`);

  let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

  console.log(`... Account Info: `);
  console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = await utils.getAccountNamedKeyValue(
    accountInfo,
    `${FACTORY_CONTRACT_NAME!}_contract_hash`

  );

  console.log(`... Contract Hash: ${contractHash}`);

  const packageHash = await utils.getAccountNamedKeyValue(
    accountInfo,
    `${FACTORY_CONTRACT_NAME!}_package_hash`
  );

  console.log(`... Package Hash: ${packageHash}`);

};

//test();
