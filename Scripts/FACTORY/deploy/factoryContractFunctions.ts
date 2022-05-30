import { config } from "dotenv";
config();
import { FACTORYClient, utils} from "../../../JsClients/FACTORY/src";
import { getDeploy } from "./utils";

import {
  CLValueBuilder,
  Keys,
  CLPublicKey,
  CLAccountHash,
  CLPublicKeyType,
} from "casper-js-sdk";

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  FACTORY_MASTER_KEY_PAIR_PATH,
  SET_FEE_TO_PAYMENT_AMOUNT,
  SET_FEE_TO_SETTER_PAYMENT_AMOUNT,
  CREATE_PAIR_PAYMENT_AMOUNT,
  CONTRACT_NAME,
  TOKEN0_CONTRACT,
  TOKEN1_CONTRACT,
  PAIR_CONTRACT,
  FACTORY_CONTRACT,
  ROUTER_PACKAGE_HASH,
  GRAPHQL
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${FACTORY_MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${FACTORY_MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const factory = new FACTORYClient(
  NODE_ADDRESS!,
  CHAIN_NAME!,
  EVENT_STREAM_ADDRESS!
);

const deploy = async () => {
  
  await factory.setContractHash(FACTORY_CONTRACT!);

  //whiteList Router 
  const set_white_list_deployHash = await factory.set_white_list(
    KEYS,
    ROUTER_PACKAGE_HASH!,
    CREATE_PAIR_PAYMENT_AMOUNT!
  );
  console.log("... Set WhiteList deploy hash: ", set_white_list_deployHash);

  await getDeploy(NODE_ADDRESS!, set_white_list_deployHash);
  console.log("... Router is whitelisted successfully.");

  // //feetosetter
  // const feetosetter = await factory.feeToSetter();
  // console.log(`... Contract feetosetter: ${feetosetter.toString()}`);

  // //allpairs
  // const allpairs = await factory.allPairs();
  // console.log(`... Contract allpairs: ${allpairs}`);

  // //createpair
  // const createpairDeployHash = await factory.createPair(
  //   KEYS,
  //   TOKEN0_CONTRACT!,
  //   TOKEN1_CONTRACT!,
  //   PAIR_CONTRACT!,
  //   CREATE_PAIR_PAYMENT_AMOUNT!
  // );
  // console.log("... CreatePair deploy hash: ", createpairDeployHash);

  // await getDeploy(NODE_ADDRESS!, createpairDeployHash);
  // console.log("... Pair created successfully");

  // //allpairs
  // const allPairs = await factory.allPairs();
  // console.log(`... Contract allpairs: ${allPairs}`);
  // // //allpairslength
  // const allpairslength = await factory.allPairsLength();
  // console.log(`... Contract allpairslength: ${allpairslength}`);

  // //pair
  // let pair = await factory.getPair(TOKEN0_CONTRACT!, TOKEN1_CONTRACT!);
  // console.log(`... Pair: ${pair}`);

  // //setfeeto
  // const setfeetoDeployHash = await factory.setFeeTo(
  //   KEYS,
  //   KEYS.publicKey,
  //   SET_FEE_TO_PAYMENT_AMOUNT!
  // );
  // console.log("... Setfeeto deploy hash: ", setfeetoDeployHash);

  // await getDeploy(NODE_ADDRESS!, setfeetoDeployHash);
  // console.log("... Setfeeto functionality successfull");


  // // feeto
  // const feeto = await factory.feeTo();
  // console.log(`... Contract feeto: ${feeto.toString()}`);

  // //setfeetosetter
  // const setfeetosetterDeployHash = await factory.setFeeToSetter(
  //   KEYS,
  //   KEYS.publicKey,
  //   SET_FEE_TO_SETTER_PAYMENT_AMOUNT!
  // );
  // console.log("... SetfeetosetterDeployHash deploy hash: ", setfeetosetterDeployHash);

  // await getDeploy(NODE_ADDRESS!, setfeetosetterDeployHash);
  // console.log("... SetfeetoSetter functionality successfull");

  // //feetosetter
  // const feeTosSetter = await factory.feeToSetter();
  // console.log(`... Contract feetosetter: ${feeTosSetter.toString()}`);

};

//deploy();
