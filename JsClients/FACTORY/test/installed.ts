import { config } from "dotenv";
config();
import { FACTORYClient, utils, constants } from "../src";
import { parseTokenMeta, sleep, getDeploy } from "./utils";
import { request } from 'graphql-request';

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
  FACTORY_MASTER_KEY_PAIR_PATH,
  SET_FEE_TO_PAYMENT_AMOUNT,
  SET_FEE_TO_SETTER_PAYMENT_AMOUNT,
  CREATE_PAIR_PAYMENT_AMOUNT,
  CONTRACT_NAME,
  TOKEN0_CONTRACT,
  TOKEN1_CONTRACT,
  PAIR_CONTRACT,
  FACTORY_CONTRACT,
  PACKAGE_HASH,
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

function splitdata(data:string)
{
    var temp=data.split('(');
    var result=temp[1].split(')');
    return result[0];
}

const test = async () => {
  
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
  // await factory.setContractHash(contractHash.slice(5));
  await factory.setContractHash( FACTORY_CONTRACT!);

  // //feetosetter
  // const feetosetter = await factory.feeToSetter();
  // console.log(`... Contract feetosetter: ${feetosetter.toString()}`);

  // //allpairs
  // const allpairs = await factory.allPairs();
  // console.log(`... Contract allpairs: ${allpairs}`);

  //createpair
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
  const set_white_list_deployHash = await factory.set_white_list(
    KEYS,
    PACKAGE_HASH!,
    CREATE_PAIR_PAYMENT_AMOUNT!
  );
  console.log("... Set WhiteList deploy hash: ", set_white_list_deployHash);

  await getDeploy(NODE_ADDRESS!, set_white_list_deployHash);
  console.log("... Router is whitelisted successfully.");

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

//test();

// export const createPair = async (paircontractHash:string,TOKEN0_CONTRACT:string,TOKEN1_CONTRACT:string) => {
  
//   console.log(`... Contract Hash: ${paircontractHash}`);

//   // We don't need hash- prefix so i'm removing it
//   await factory.setContractHash(paircontractHash);

//   //pair
//   let pair = await factory.createPair(TOKEN0_CONTRACT, TOKEN1_CONTRACT,paircontractHash);
//   console.log(`... Pair: ${pair}`);

//   return pair;
  
// };

export const getPair = async (contractHash:string,TOKEN0_CONTRACT:string,TOKEN1_CONTRACT:string) => {
  
  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  await factory.setContractHash(contractHash);

  //pair
  let pair = await factory.getPair(TOKEN0_CONTRACT, TOKEN1_CONTRACT);
  console.log(`... Pair: ${pair}`);

  return pair;
  
};
//getPair("202dffe0821C291870c864378c38fCE0BC4Fe7EA571341c62243e92608005BEe","4ae77D7D5ae22b60fC9CA97d952617C1f312b9740771E0e380Da909Bf8A8e2f2","c71567459Ba27504318e44948891cF42eb506b4BE1d31B81eA0280a65a22A3D9");
