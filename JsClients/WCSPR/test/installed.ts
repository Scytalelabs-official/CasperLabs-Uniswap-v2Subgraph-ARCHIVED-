import { config } from "dotenv";
config();
import { ERC20Client ,utils, constants} from "../src";
import { sleep, getDeploy } from "./utils";
import { request } from 'graphql-request';

import {
  CLValueBuilder,
  Keys,
  CLPublicKey,
  CLAccountHash,
  CLPublicKeyType,
  Contracts,
} from "casper-js-sdk";

const { ERC20Events } = constants;

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  ERC20_MASTER_KEY_PAIR_PATH,
  ERC20_CONTRACT_NAME,
  MINT_PAYMENT_AMOUNT,
  MINT_AMOUNT,
  BURN_PAYMENT_AMOUNT,
  BURN_AMOUNT,
  APPROVE_PAYMENT_AMOUNT,
  APPROVE_AMOUNT,
  TRANSFER_PAYMENT_AMOUNT,
  TRANSFER_AMOUNT,
  TRANSFER_FROM_PAYMENT_AMOUNT,
  TRANSFER_FROM_AMOUNT,
  TOKEN0_CONTRACT,
  TOKEN1_CONTRACT,
  TOKEN1_CONTRACT_PACKAGE,
  PAIR_CONTRACT,
  PACKAGE_HASH,
  AMOUNT_A_DESIRED,
  AMOUNT_B_DESIRED,
  MASTER_KEY_PAIR_PATH,
  PAIR_CONTRACT_PACKAGE,
  GRAPHQL,
  WCSPR
} = process.env;


const KEYS = Keys.Ed25519.parseKeyFiles(
  `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const ROUTERKEYS = Keys.Ed25519.parseKeyFiles(
  `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

function splitdata(data:string)
{
    var temp=data.split('(');
    var result=temp[1].split(')');
    return result[0];
}

const erc20 = new ERC20Client(
  NODE_ADDRESS!,
  CHAIN_NAME!,
  EVENT_STREAM_ADDRESS!
);

const test = async () => {

  // const listener = erc20.onEvent(
  //   [
  //     ERC20Events.Approval,
  //     ERC20Events.Transfer
  //   ],
  //   async (eventName, deploy, result) => {
  //     if (deploy.success) {
  //       console.log(`Successfull deploy of: ${eventName}, deployHash: ${deploy.deployHash}`);
  //       const [timestamp,gasPrice,block_hash]= await getDeploy(NODE_ADDRESS!, deploy.deployHash);
  //       console.log("... Deployhash: ",  deploy.deployHash);
  //       console.log("... Timestamp: ", timestamp);
  //       //console.log("... GasPrice: ", gasPrice);
  //       console.log("... Block hash: ", block_hash);

  //       let newData = JSON.parse(JSON.stringify(result.value()));
    
  //       if(eventName=="approve")
	// 			{
  //           console.log(eventName+ " Event result: ");
  //           console.log(newData[0][0].data + " = " + newData[0][1].data);
  //           console.log(newData[1][0].data + " = " + newData[1][1].data);
  //           console.log(newData[2][0].data + " = " + newData[2][1].data);
  //           console.log(newData[3][0].data + " = " + newData[3][1].data);
  //           console.log(newData[4][0].data + " = " + newData[4][1].data);
	// 			}
	// 			else if(eventName=="erc20_transfer")
	// 			{
  //           console.log(eventName+ " Event result: ");
  //           console.log(newData[0][0].data + " = " + newData[0][1].data);
  //           console.log(newData[1][0].data + " = " + newData[1][1].data);

  //           console.log(newData[2][0].data + " = " + newData[2][1].data);
  //           console.log(newData[3][0].data + " = " + newData[3][1].data);
  //           console.log(newData[4][0].data + " = " + newData[4][1].data);
            
  //           var flag=0;
  //           var temp=(newData[3][1].data).split('(');
  //           console.log("temp[0]: ",temp[0]);
  //           if(temp[0] == "Key::Account(")
  //           {
  //             flag=1;
  //           }
  //           var from=splitdata(newData[2][1].data);
  //           var to=splitdata(newData[3][1].data);
  //           var value=parseInt(newData[4][1].data);

  //           console.log("from: ", from);
  //           console.log("to: ", to);
  //           console.log("value: ",value);
            
  //           if(flag==0)
  //           {
  //             request(GRAPHQL!,
  //               `mutation handleTransfer( $from: String!, $to: String!, $value: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
  //               handleTransfer( from: $from, to: $to, value: $value, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
  //               result
  //               }
              
  //               }`,
  //               {from:from, to: to, value: value, pairAddress: to, deployHash:deploy.deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
  //               .then(data => console.log(data))
  //               .catch(error => console.error(error));
  //           }
					
	// 			}

  //     } else {
  //       console.log(`Failed deploy of ${eventName}, deployHash: ${deploy.deployHash}`);
  //       console.log(`Error: ${deploy.error}`);
  //     }
  //   }
  // );
  // console.log("listener: ",listener);

  await erc20.setContractHash(WCSPR!);

  // // //name
  // // const name = await erc20.name();
  // // console.log(`... Contract name: ${name}`);

  // // //symbol
  // // const symbol = await erc20.symbol();
  // // console.log(`... Contract symbol: ${symbol}`);

  // // //decimal
  // // const decimal = await erc20.decimal();
  // // console.log(`... Contract decimal: ${decimal}`);

  // // //totalsupply
  // // let totalSupply = await erc20.totalSupply();
  // // console.log(`... Total supply: ${totalSupply}`);

  // // // //balanceof
  // // let balance = await erc20.balanceOf(KEYS.publicKey);
  // // console.log(`... Balance of account ${KEYS.publicKey.toAccountHashStr()}`);
  // // console.log(`... Balance: ${balance}`);

  // // //nonce
  // // let nonce = await erc20.nonce(KEYS.publicKey);
  // // console.log(`... Nonce: ${nonce}`);

  // // // //allowance
  // // // let allowance = await erc20.allowance(KEYS.publicKey,KEYS.publicKey);
  // // // console.log(`... Allowance: ${allowance}`);

  //mint
  const depositDeployHash = await erc20.deposit_no_return(
    ROUTERKEYS,
    ROUTERKEYS.publicKey,
    MINT_AMOUNT!,
    MINT_PAYMENT_AMOUNT!
  );
  console.log("... Deposit deploy hash: ", depositDeployHash);

  await getDeploy(NODE_ADDRESS!, depositDeployHash);
  console.log("... Deposited successfully.");

  //  balanceof
  // let balance = await erc20.balanceOfcontract(PAIR_CONTRACT!);
  // console.log(`... Balance: ${balance}`);

  // // //burn
  // // const burnDeployHash = await erc20.burn(
  // //   KEYS,
  // //   KEYS.publicKey,
  // //   BURN_AMOUNT!,
  // //   BURN_PAYMENT_AMOUNT!
  // // );
  // // console.log("... Burn deploy hash: ", burnDeployHash);

  // // await getDeploy(NODE_ADDRESS!, burnDeployHash);
  // // console.log("... Token burned successfully");

  // // //totalsupply
  // // totalSupply = await erc20.totalSupply();
  // // console.log(`... Total supply: ${totalSupply}`);

  //approve
  // const approveDeployHash = await erc20.approve(
  //   ROUTERKEYS,
  //   PACKAGE_HASH!,
  //   AMOUNT_A_DESIRED!,
  //   APPROVE_PAYMENT_AMOUNT!
  // );
  // console.log("... Approve deploy hash: ", approveDeployHash);

  // await getDeploy(NODE_ADDRESS!, approveDeployHash);
  // console.log("... Token approved successfully");

  // // //transfer
  // // const transferDeployHash = await erc20.transfer(
  // //   KEYS,
  // //   KEYS.publicKey,
  // //   TRANSFER_AMOUNT!,
  // //   TRANSFER_PAYMENT_AMOUNT!
  // // );
  // // console.log("... Transfer deploy hash: ", transferDeployHash);

  // // await getDeploy(NODE_ADDRESS!, transferDeployHash);
  // // console.log("... Token transfer successfully");

  // // //transfer_from
  // // const transferfromDeployHash = await erc20.transferFrom(
  // //   KEYS,
  // //   KEYS.publicKey,
  // //   KEYS.publicKey,
  // //   TRANSFER_FROM_AMOUNT!,
  // //   TRANSFER_FROM_PAYMENT_AMOUNT!
  // // );
  // // console.log("... TransferFrom deploy hash: ", transferfromDeployHash);

  // // await getDeploy(NODE_ADDRESS!, transferfromDeployHash);
  // // console.log("... Token transfer successfully");

};


//test();

export const getName = async (contractHash:string) => {
  
  // We don't need hash- prefix so i'm removing it
  await erc20.setContractHash(contractHash);

  //name
  const name = await erc20.name();
  console.log(contractHash +` =... Contract name: ${name}`);

  return name;
  
};

export const getSymbol = async (contractHash:string) => {
  
  // We don't need hash- prefix so i'm removing it
  await erc20.setContractHash(contractHash);

  //symbol
  const symbol = await erc20.symbol();
  console.log(contractHash +` =... Contract symbol: ${symbol}`);

  return symbol;
  
};

export const getDecimals = async (contractHash:string) => {
  
  // We don't need hash- prefix so i'm removing it
  await erc20.setContractHash(contractHash);

  //decimal
  const decimal = await erc20.decimal();
  console.log(contractHash +" =... Contract decimal: ", decimal);

  return decimal;
  
};

export const getTotalSupply = async (contractHash:string) => {
  
  // We don't need hash- prefix so i'm removing it
  await erc20.setContractHash(contractHash);

   //totalsupply
   let totalSupply = await erc20.totalSupply();
   console.log(contractHash +` = ... Total supply: ${totalSupply}`);

  return totalSupply;
  
};
