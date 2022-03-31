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
  CLByteArray
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
  GRAPHQL
} = process.env;


const KEYS = Keys.Ed25519.parseKeyFiles(
  `${ERC20_MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${ERC20_MASTER_KEY_PAIR_PATH}/secret_key.pem`
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

  await erc20.setContractHash(TOKEN1_CONTRACT!);
  //getTotalSupply(TOKEN1_CONTRACT!);
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
  // let balance = await erc20.balanceOf("7b217a09296d5ce360847a7d20f623476157c5f022333c4e988a464035cadd80");
  // console.log(`... Balance: ${balance}`);

  // // //nonce
  // // let nonce = await erc20.nonce(KEYS.publicKey);
  // // console.log(`... Nonce: ${nonce}`);

  // // // //allowance
  //let allowance = await erc20.allowance(KEYS.publicKey,KEYS.publicKey);
 // console.log(`... Allowance: ${allowance}`);
 
  //mint
  const mintDeployHash = await erc20.mint(
    ROUTERKEYS,
    ROUTERKEYS.publicKey,
    MINT_AMOUNT!,
    MINT_PAYMENT_AMOUNT!
  );
  console.log("... Mint deploy hash: ", mintDeployHash);

  await getDeploy(NODE_ADDRESS!, mintDeployHash);
  console.log("... Token minted successfully.");

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
  const approveDeployHash = await erc20.approve(
    ROUTERKEYS,
    PACKAGE_HASH!,
    AMOUNT_B_DESIRED!,
    APPROVE_PAYMENT_AMOUNT!
  );
  console.log("... Approve deploy hash: ", approveDeployHash);

  await getDeploy(NODE_ADDRESS!, approveDeployHash);
  console.log("... Token approved successfully");

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


// test();

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

export const balanceOf = async (contractHash:string, key:string) => {
  
  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  await erc20.setContractHash(contractHash);

 //balanceof
  let balance = await erc20.balanceOf(key);

  console.log(`... Balance: ${balance}`);

  return balance;

};

export const allowance = async (contractHash:string, ownerkey:string, spenderkey:string) => {
  
  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  await erc20.setContractHash(contractHash);

  let allowance = await erc20.allowance(ownerkey,spenderkey);

  console.log(`... Allowance: ${allowance}`);

  return allowance;

};

//allowance("b761da7d5ef67f8825c30c40df8b72feca4724eb666dba556b0e3f67778143e0","8b217a09296d5ce360847a7d20f623476157c5f022333c4e988a464035cadd80","8a74e1ae230936013f3b544182b8011435f4a457d9444fa879ab483fdf829dc8");