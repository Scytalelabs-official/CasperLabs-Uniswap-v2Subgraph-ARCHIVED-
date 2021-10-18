import { config } from "dotenv";
config();
import { FACTORYClient, utils, constants } from "../src";
import { parseTokenMeta, sleep, getDeploy } from "./utils";

import {
  CLValueBuilder,
  Keys,
  CLPublicKey,
  CLAccountHash,
  CLPublicKeyType,
} from "casper-js-sdk";

const { FACTORYEvents } = constants;

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  WASM_PATH,
  MASTER_KEY_PAIR_PATH,
  RECEIVER_ACCOUNT_ONE,
  INSTALL_PAYMENT_AMOUNT,
  SET_FEE_TO_PAYMENT_AMOUNT,
  SET_FEE_TO_SETTER_PAYMENT_AMOUNT,
  CREATE_PAIR_PAYMENT_AMOUNT,
  CONTRACT_NAME,
  TOKEN0_CONTRACT,
  TOKEN1_CONTRACT,
  PAIR_CONTRACT,
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const test = async () => {
  const factory = new FACTORYClient(
    NODE_ADDRESS!,
    CHAIN_NAME!,
    EVENT_STREAM_ADDRESS!
  );

  const listener = factory.onEvent(
    [
      FACTORYEvents.SetFeeTo,
      FACTORYEvents.SetFeeToSetter,
      FACTORYEvents.CreatePair
    ],
    (eventName, deploy, result) => {
      if (deploy.success) {
        console.log(`Successfull deploy of: ${eventName}, deployHash: ${deploy.deployHash}`);
        console.log(result.value());
      } else {
        console.log(`Failed deploy of ${eventName}, deployHash: ${deploy.deployHash}`);
        console.log(`Error: ${deploy.error}`);
      }
    }
  );

  await sleep(5 * 1000);

  let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

  console.log(`... Account Info: `);
  console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = await utils.getAccountNamedKeyValue(
    accountInfo,
    `${CONTRACT_NAME!}_contract_hash`
  );

  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  await factory.setContractHash(contractHash.slice(5));


  //feetosetter
  const feetosetter = await factory.feeToSetter();
  console.log(`... Contract feetosetter: ${feetosetter.toString()}`);

  //allpairs
  const allpairs = await factory.allPairs();
  console.log(`... Contract allpairs: ${allpairs}`);

  //createpair
  const createpairDeployHash = await factory.createPair(
    KEYS,
    TOKEN0_CONTRACT!,
    TOKEN1_CONTRACT!,
    PAIR_CONTRACT!,
    CREATE_PAIR_PAYMENT_AMOUNT!
  );
  console.log("... CreatePair deploy hash: ", createpairDeployHash);

  await getDeploy(NODE_ADDRESS!, createpairDeployHash);
  console.log("... Pair created successfully");


  //allpairs
  const allPairs = await factory.allPairs();
  console.log(`... Contract allpairs: ${allPairs}`);
  // //allpairslength
  const allpairslength = await factory.allPairsLength();
  console.log(`... Contract allpairslength: ${allpairslength}`);

  //pair
  let pair = await factory.getPair(TOKEN0_CONTRACT!, TOKEN1_CONTRACT!);
  console.log(`... Pair: ${pair}`);

  //setfeeto
  const setfeetoDeployHash = await factory.setFeeTo(
    KEYS,
    KEYS.publicKey,
    SET_FEE_TO_PAYMENT_AMOUNT!
  );
  console.log("... Setfeeto deploy hash: ", setfeetoDeployHash);

  await getDeploy(NODE_ADDRESS!, setfeetoDeployHash);
  console.log("... Setfeeto functionality successfull");


  // feeto
  const feeto = await factory.feeTo();
  console.log(`... Contract feeto: ${feeto.toString()}`);

  //setfeetosetter
  const setfeetosetterDeployHash = await factory.setFeeToSetter(
    KEYS,
    KEYS.publicKey,
    SET_FEE_TO_SETTER_PAYMENT_AMOUNT!
  );
  console.log("... SetfeetosetterDeployHash deploy hash: ", setfeetosetterDeployHash);

  await getDeploy(NODE_ADDRESS!, setfeetosetterDeployHash);
  console.log("... SetfeetoSetter functionality successfull");

  //feetosetter
  const feeTosSetter = await factory.feeToSetter();
  console.log(`... Contract feetosetter: ${feeTosSetter.toString()}`);

};

test();
