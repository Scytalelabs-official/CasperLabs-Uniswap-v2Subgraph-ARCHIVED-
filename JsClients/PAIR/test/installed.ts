import { config } from "dotenv";
config();
import { PAIRClient, utils, constants } from "../src";
import { parseTokenMeta, sleep, getDeploy } from "./utils";
import { request } from 'graphql-request';

import {
  CLValueBuilder,
  Keys,
  CLPublicKey,
  CLAccountHash,
  CLPublicKeyType,
} from "casper-js-sdk";

const { PAIREvents } = constants;

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  PAIR_MASTER_KEY_PAIR_PATH,
  INITIALIZE_PAYMENT_AMOUNT,
  MINT_PAYMENT_AMOUNT,
  BURN_PAYMENT_AMOUNT,
  APPROVE_PAYMENT_AMOUNT,
  APPROVE_AMOUNT,
  TRANSFER_PAYMENT_AMOUNT,
  TRANSFER_AMOUNT,
  TRANSFER_FROM_PAYMENT_AMOUNT,
  TRANSFER_FROM_AMOUNT,
  SKIM_PAYMENT_AMOUNT,
  SYNC_PAYMENT_AMOUNT,
  SWAP_PAYMENT_AMOUNT,
  SET_TREASURY_FEE_PERCENT_PAYMENT_AMOUNT,
  FACTORY_CONTRACT,
  TOKEN0_CONTRACT,
  TOKEN1_CONTRACT,
  PAIR_CONTRACT_NAME,
  GRAPHQL,
  PAIR_CONTRACT
} = process.env;

// const TOKEN_META = new Map(parseTokenMeta(process.env.TOKEN_META!));

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
  
  const listener = pair.onEvent(
    [
      PAIREvents.Approval,
      PAIREvents.Transfer,
      PAIREvents.Mint,
      PAIREvents.Burn,
      PAIREvents.Sync,
      PAIREvents.Swap,
    ],
    async (eventName, deploy, result) => {
      if (deploy.success) {
        console.log(`Successfull deploy of: ${eventName}, deployHash: ${deploy.deployHash}`);
          const [timestamp,block_hash]= await getDeploy(NODE_ADDRESS!, deploy.deployHash);
          console.log("... Deployhash: ",  deploy.deployHash);
          console.log("... Timestamp: ", timestamp);
          console.log("... Block hash: ", block_hash);
          
          let newData = JSON.parse(JSON.stringify(result.value()));

          // console.log(eventName+ " Event result: ");
          // console.log(newData[0][0].data + " = " + newData[0][1].data);
          // console.log(newData[1][0].data + " = " + newData[1][1].data);
          // console.log(newData[2][0].data + " = " + newData[2][1].data);
          // console.log(newData[3][0].data + " = " + newData[3][1].data);
          // console.log(newData[4][0].data + " = " + newData[4][1].data);
          // console.log(newData[5][0].data + " = " + newData[5][1].data);
          // console.log(newData[6][0].data + " = " + newData[6][1].data);
          // console.log(newData[7][0].data + " = " + newData[7][1].data);
          // console.log(newData[8][0].data + " = " + newData[8][1].data);
          // console.log(newData[9][0].data + " = " + newData[9][1].data);

          if(eventName=="transfer")
          {
            console.log(eventName+ " Event result: ");
            console.log(newData[0][0].data + " = " + newData[0][1].data);
            console.log(newData[1][0].data + " = " + newData[1][1].data);

            console.log(newData[2][0].data + " = " + newData[2][1].data);
            console.log(newData[3][0].data + " = " + newData[3][1].data);
            console.log(newData[4][0].data + " = " + newData[4][1].data);
            console.log(newData[5][0].data + " = " + newData[5][1].data);

            var from1=(newData[2][1].data).split('(');
            var from=from1[1].split(')');

            var to1=(newData[4][1].data).split('(');
            var to=to1[1].split(')');

            var value=newData[5][1].data;

            var pair1=newData[3][1].data.split('(');
            var pair=pair1[1].split(')');

            console.log("from: ", from[0]);
            console.log("to: ", to[0]);
            console.log("value: ", parseInt(value));
            console.log("pair: ", pair[0]);

            // request(GRAPHQL!,
            //   `mutation handleTransfer( $from: String!, $to: String!, $value: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: Int!, $blockHash: String!){
            //   handleTransfer( from: $from, to: $to, value: $value, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
            //      result
            //    }
             
            //   }`,
            //    {from:newData[2][1].data, to: newData[3][1].data, value: newData[4][1].data, pairAddress: newData[5][1].data, deployHash:deploy.deployHash,timeStamp:timestamp, blockHash:block_hash})
            //    .then(data => console.log(data))
            //    .catch(error => console.error(error));
          }
          else if (eventName=="mint")
          {
            request(GRAPHQL!,
              `mutation handleMint( $amount0: String!, $amount1: String!, $sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: Int!, $blockHash: String!){
                handleMint( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                   result
                 }
               
                }`,
                 {amount0:newData[3][1].data, amount1: newData[4][1].data, sender: newData[2][1].data,logIndex:0, pairAddress: newData[5][1].data, deployHash:deploy.deployHash,timeStamp:timestamp, blockHash:block_hash})
                 .then(data => console.log(data))
                 .catch(error => console.error(error));
          }
          else if (eventName=="burn")
          {
            request(GRAPHQL!,
              `mutation handleBurn( $amount0: String!, $amount1: String!, $sender: String!,$logIndex: Int!,$to: String!, $pairAddress: String!, $deployHash: String!, $timeStamp: Int!, $blockHash: String!){
                handleBurn( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, to:$to, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                   result
                 }
               
                }`,
                 {amount0:newData[3][1].data, amount1: newData[4][1].data, sender: newData[2][1].data,logIndex:0, to:newData[5][1].data,pairAddress: newData[6][1].data, deployHash:deploy.deployHash,timeStamp:timestamp, blockHash:block_hash})
                 .then(data => console.log(data))
                 .catch(error => console.error(error));
          }
          else if (eventName=="sync")
          {
            request(GRAPHQL!,
              `mutation handleSync( $reserve0: String!, $reserve1: String!, $pairAddress: String!){
               handleSync( reserve0: $reserve0, reserve1: $reserve1, pairAddress: $pairAddress) {
                result
               }
             
              }`,
               {reserve0:newData[2][1].data, reserve1: newData[3][1].data, pairAddress: newData[4][1].data})
               .then(data => console.log(data))
               .catch(error => console.error(error));
          }
          else if (eventName=="swap")
          {
            request(GRAPHQL!,
              `mutation handleSwap( $amount0In: String!, $amount1In: String!, $amount0Out: String!, $amount1Out: String!, $to: String!,$from: String!,$sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: Int!, $blockHash: String!){
                handleSwap( amount0In: $amount0In, amount1In: $amount1In, amount0Out: $amount0Out, amount1Out: $amount1Out, to:$to, from:$from,sender: $sender,logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
                   result
                 }
               
                }`,
                 {amount0In:newData[3][1].data, amount1In: newData[4][1].data,amount0Out:newData[5][1].data, amount1Out: newData[6][1].data,to:newData[7][1].data,from:newData[8][1].data, sender: newData[2][1].data,logIndex:0,pairAddress: newData[9][1].data, deployHash:deploy.deployHash,timeStamp:timestamp, blockHash:block_hash})
                 .then(data => console.log(data))
                 .catch(error => console.error(error));
          }
          
          
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
    `${PAIR_CONTRACT_NAME!}_contract_hash`
  );

  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  //await pair.setContractHash(contractHash.slice(5));
  await pair.setContractHash(PAIR_CONTRACT!);

  // //name
  // const name = await pair.name();
  // console.log(`... Contract name: ${name}`);

  // //symbol
  // const symbol = await pair.symbol();
  // console.log(`... Contract symbol: ${symbol}`);

  // //initialize
  // const initializeDeployHash = await pair.initialize(
  //   KEYS,
  //   TOKEN0_CONTRACT!,
  //   TOKEN1_CONTRACT!,
  //   FACTORY_CONTRACT!,
  //   INITIALIZE_PAYMENT_AMOUNT!
  // );
  // console.log("... Initialize deploy hash: ", initializeDeployHash);

  // await getDeploy(NODE_ADDRESS!, initializeDeployHash);
  // console.log("... Token Initialized successfully");


  // //erc20mint
  // const erc20MintToken0DeployHash = await pair.erc20MintMethod(
  //   KEYS,
  //   TOKEN0_CONTRACT!,
  //   "1000"!,
  //   MINT_PAYMENT_AMOUNT!
  // );
  // console.log("...ERC20 Mint deploy hash: ", erc20MintToken0DeployHash);


  // await getDeploy(NODE_ADDRESS!, erc20MintToken0DeployHash);
  // console.log("...ERC20 Token minted successfully");


  // //erc20mint
  // const erc20MintToken1DeployHash = await pair.erc20MintMethod(
  //   KEYS,
  //   TOKEN1_CONTRACT!,
  //   "1000"!,
  //   MINT_PAYMENT_AMOUNT!
  // );
  // console.log("...ERC20 Mint deploy hash: ", erc20MintToken1DeployHash);

  // await getDeploy(NODE_ADDRESS!, erc20MintToken1DeployHash);
  // console.log("...ERC20 Token minted successfully");

  // //token0
  // const token0 = await pair.token0();
  // console.log(`... Contract token0: ${token0}`);

  // //token1
  // const token1 = await pair.token1();
  // console.log(`... Contract token1: ${token1}`);

  // //treasuryfee
  // const treasuryfee = await pair.treasuryFee();
  // console.log(`... Contract treasuryfee: ${treasuryfee}`);

  // //totalsupply
  // let totalSupply = await pair.totalSupply();
  // console.log(`... Total supply: ${totalSupply}`);

  // //balanceof
  // let balance = await pair.balanceOf(KEYS.publicKey);
  // console.log(`... Balance of account ${KEYS.publicKey.toAccountHashStr()}`);
  // console.log(`... Balance: ${balance}`);

  // //balanceof
  // let nonce = await pair.nonce(KEYS.publicKey);
  // console.log(`... Nonce: ${nonce}`);

  //allowance
  // let allowance = await pair.allowance(KEYS.publicKey, KEYS.publicKey);
  // console.log(`... Allowance: ${allowance}`);

  //erc20_mint
  //mint
  // const erc20mint0DeployHash = await pair.erc20Mint(
  //   KEYS,
  //   TOKEN0_CONTRACT!,
  //   "1000"!,
  //   MINT_PAYMENT_AMOUNT!
  // );
  // console.log("... Mint deploy hash: ", erc20mint0DeployHash);

  // await getDeploy(NODE_ADDRESS!, erc20mint0DeployHash);
  // console.log("... Token minted successfully");


  // //erc20mint
  // const erc20mint1DeployHash = await pair.erc20Mint(
  //   KEYS,
  //   TOKEN1_CONTRACT!,
  //   "1000"!,
  //   MINT_PAYMENT_AMOUNT!
  // );
  // console.log("... Mint deploy hash: ", erc20mint1DeployHash);

  // await getDeploy(NODE_ADDRESS!, erc20mint1DeployHash);
  // console.log("... Token minted successfully");



  // //sync
  // const syncDeployHash = await pair.sync(
  //   KEYS,
  //   KEYS.publicKey,
  //   SYNC_PAYMENT_AMOUNT!
  // );
  // console.log("... sync deploy hash: ", syncDeployHash);



  // await getDeploy(NODE_ADDRESS!, syncDeployHash);
  // console.log("... Sync functionality successfull");


  //mint
  // const mintDeployHash = await pair.mint(
  //   KEYS,
  //   KEYS.publicKey,
  //   MINT_PAYMENT_AMOUNT!
  // );
  // console.log("... Mint deploy hash: ", mintDeployHash);

  // await getDeploy(NODE_ADDRESS!, mintDeployHash);
  // console.log("... Token minted successfully");

  // //burn
  // const burnDeployHash = await pair.burn(
  //   KEYS,
  //   KEYS.publicKey,
  //   BURN_PAYMENT_AMOUNT!
  // );
  // console.log("... Burn deploy hash: ", burnDeployHash);

  // await getDeploy(NODE_ADDRESS!, burnDeployHash);
  // console.log("... Token burned successfully");

  // //totalsupply
  // totalSupply = await pair.totalSupply();
  // console.log(`... Total supply: ${totalSupply}`);

  // //approve
  // const approveDeployHash = await pair.approve(
  //   KEYS,
  //   KEYS.publicKey,
  //   APPROVE_AMOUNT!,
  //   APPROVE_PAYMENT_AMOUNT!
  // );
  // console.log("... Approve deploy hash: ", approveDeployHash);

  // await getDeploy(NODE_ADDRESS!, approveDeployHash);
  // console.log("... Token approved successfully");

  //transfer
  const transferDeployHash = await pair.transfer(
    KEYS,
    KEYS.publicKey,
    TRANSFER_AMOUNT!,
    TRANSFER_PAYMENT_AMOUNT!
  );
  console.log("... Transfer deploy hash: ", transferDeployHash);

  await getDeploy(NODE_ADDRESS!, transferDeployHash);
  console.log("... Token transfer successfully");

  // //transfer_from
  // const transferfromDeployHash = await pair.transferFrom(
  //   KEYS,
  //   KEYS.publicKey,
  //   KEYS.publicKey,
  //   TRANSFER_FROM_AMOUNT!,
  //   TRANSFER_FROM_PAYMENT_AMOUNT!
  // );
  // console.log("... TransferFrom deploy hash: ", transferfromDeployHash);

  // await getDeploy(NODE_ADDRESS!, transferfromDeployHash);
  // console.log("... Token transfer successfully");

  // //skim
  // const skimDeployHash = await pair.skim(
  //   KEYS,
  //   KEYS.publicKey,
  //   SKIM_PAYMENT_AMOUNT!
  // );
  // console.log("... skim deploy hash: ", skimDeployHash);

  // await getDeploy(NODE_ADDRESS!, skimDeployHash);
  // console.log("... Skim functionality successfull");


  // //swap
  // const swapDeployHash = await pair.swap(
  //   KEYS,
  //   "10",
  //   "20",
  //   KEYS.publicKey,
  //   "",
  //   SWAP_PAYMENT_AMOUNT!
  // );
  // console.log("... swap deploy hash: ", swapDeployHash);

  // await getDeploy(NODE_ADDRESS!, swapDeployHash);
  // console.log("... Swap functionality successfull");

  // //settreasuryfeepercent
  // const settreasuryfeepercentDeployHash = await pair.setTreasuryFeePercent(
  //   KEYS,
  //   "10",
  //   SET_TREASURY_FEE_PERCENT_PAYMENT_AMOUNT!
  // );
  // console.log("... setTreasuryFeePercent deploy hash: ", settreasuryfeepercentDeployHash);

  // await getDeploy(NODE_ADDRESS!, settreasuryfeepercentDeployHash);
  // console.log("... setTreasuryFeePercent functionality successfull");

  // //treasuryfee
  // const treasuryFee = await pair.treasuryFee();
  // console.log(`... Contract treasuryfee: ${treasuryFee}`);

};

test();

export const balanceOf = async (contractHash:string, key:string) => {
  
  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  await pair.setContractHash(contractHash);

  //how to convert string into AccountHash
  
 //balanceof
 //let balance = await pair.balanceOf(key);
 //console.log(`... Balance of account ${key.toAccountHashStr()}`);
 //console.log(`... Balance: ${balance}`);

  //return balance;
  return 100;
};