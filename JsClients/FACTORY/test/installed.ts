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

const test = async () => {
  
  const listener = factory.onEvent(
    [
      FACTORYEvents.PairCreated
    ],
    async (eventName, deploy, result) => {
      if (deploy.success) {
        console.log(`Successfull deploy of: ${eventName}, deployHash: ${deploy.deployHash}`);
        const [timestamp,gasPrice,block_hash]= await getDeploy(NODE_ADDRESS!, deploy.deployHash);
        console.log("... Deployhash: ",  deploy.deployHash);
        console.log("... Timestamp: ", timestamp);
        console.log("... Block hash: ", block_hash);

        let newData = JSON.parse(JSON.stringify(result.value()));
        
        console.log(eventName+ " Event result: ");
        console.log(newData[0][0].data + " = " + newData[0][1].data);
        console.log(newData[1][0].data + " = " + newData[1][1].data);
        console.log(newData[2][0].data + " = " + newData[2][1].data);
        console.log(newData[3][0].data + " = " + newData[3][1].data);
        console.log(newData[4][0].data + " = " + newData[4][1].data);
        console.log(newData[5][0].data + " = " + newData[5][1].data);

        request('http://localhost:3000/graphql',
        `mutation handleNewPair( $token0: String!, $token1: String!, $pair: String!, $all_pairs_length: Int!, $timeStamp: Int!, $blockHash: String!){
         handleNewPair( token0: $token0, token1: $token1, pair: $pair, all_pairs_length: $all_pairs_length, timeStamp: $timeStamp, blockHash: $blockHash) {
           id
         }
       
        }`,
         {token0:'51254d70d183f4b1e59ee5d5b0c76d3c3a81d0366278beecc05b546d49a9835c', token1: '96b0431770a34f5b651a43c830f3c8537e7c44f2cb8191d7efbcca2379785cda', pair: '11f6e1b2d9566ab6d796f026b1d4bd36b71664c4ee8805fbc9cdca406607cd59', all_pairs_length: 5, timeStamp:1000, blockHash:'0000000000000000000000000000000000000000000000000000000000000000'})
         .then(data => console.log(data))
         .catch(error => console.error(error));

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

//test();

export const getPair = async (contractHash:string,TOKEN0_CONTRACT:string,TOKEN1_CONTRACT:string) => {
  
  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  await factory.setContractHash(contractHash);

  //pair
  let pair = await factory.getPair(TOKEN0_CONTRACT, TOKEN1_CONTRACT);
  console.log(`... Pair: ${pair}`);

  return pair;
  
};
