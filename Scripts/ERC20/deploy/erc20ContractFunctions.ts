import { config } from "dotenv";
config();
import { ERC20Client } from "../../../JsClients/ERC20/src";
import { getDeploy } from "./utils";

import {
  CLValueBuilder,
  Keys,
  CLPublicKey,
  CLAccountHash,
  CLPublicKeyType,
  Contracts,
  CLByteArray
} from "casper-js-sdk";

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
  ROUTER_PACKAGE_HASH,
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

const erc20 = new ERC20Client(
  NODE_ADDRESS!,
  CHAIN_NAME!,
  EVENT_STREAM_ADDRESS!
);

const deploy = async () => {

  await erc20.setContractHash(TOKEN1_CONTRACT!);
  
  // //name
  // const name = await erc20.name();
  // console.log(`... Contract name: ${name}`);

  // //symbol
  // const symbol = await erc20.symbol();
  // console.log(`... Contract symbol: ${symbol}`);

  // //decimal
  // const decimal = await erc20.decimal();
  // console.log(`... Contract decimal: ${decimal}`);

  // //totalsupply
  // let totalSupply = await erc20.totalSupply();
  // console.log(`... Total supply: ${totalSupply}`);

  // // balanceof

  // let balance = await erc20.balanceOf("282fabb87a057d991937770223de98ae86f6e652a050825aa196dfd4f480029e");
  // console.log(`... Balance: ${balance}`);

  // // //nonce
  // let nonce = await erc20.nonce(KEYS.publicKey);
  // console.log(`... Nonce: ${nonce}`);

  // //allowance
  // let allowance = await erc20.allowance("282fabb87a057d991937770223de98ae86f6e652a050825aa196dfd4f480029e","282fabb87a057d991937770223de98ae86f6e652a050825aa196dfd4f480029e");
  // console.log(`... Allowance: ${allowance}`);
 
  //mint
  const mintDeployHash = await erc20.mint(
    KEYS,
    KEYS.publicKey,
    MINT_AMOUNT!,
    MINT_PAYMENT_AMOUNT!
  );
  console.log("... Mint deploy hash: ", mintDeployHash);

  await getDeploy(NODE_ADDRESS!, mintDeployHash);
  console.log("... Token minted successfully.");

  // // //burn
  // const burnDeployHash = await erc20.burn(
  //   KEYS,
  //   KEYS.publicKey,
  //   BURN_AMOUNT!,
  //   BURN_PAYMENT_AMOUNT!
  // );
  // console.log("... Burn deploy hash: ", burnDeployHash);

  // await getDeploy(NODE_ADDRESS!, burnDeployHash);
  // console.log("... Token burned successfully");

  // //totalsupply
  // totalSupply = await erc20.totalSupply();
  // console.log(`... Total supply: ${totalSupply}`);

  //approve
  // const approveDeployHash = await erc20.approve(
  //   KEYS,
  //   ROUTER_PACKAGE_HASH!,
  //   AMOUNT_B_DESIRED!,
  //   APPROVE_PAYMENT_AMOUNT!
  // );
  // console.log("... Approve deploy hash: ", approveDeployHash);

  // await getDeploy(NODE_ADDRESS!, approveDeployHash);
  // console.log("... Token approved successfully");

  // //transfer
  // const transferDeployHash = await erc20.transfer(
  //   KEYS,
  //   KEYS.publicKey,
  //   TRANSFER_AMOUNT!,
  //   TRANSFER_PAYMENT_AMOUNT!
  // );
  // console.log("... Transfer deploy hash: ", transferDeployHash);

  // await getDeploy(NODE_ADDRESS!, transferDeployHash);
  // console.log("... Token transfer successfully");

  // //transfer_from
  // const transferfromDeployHash = await erc20.transferFrom(
  //   KEYS,
  //   KEYS.publicKey,
  //   KEYS.publicKey,
  //   TRANSFER_FROM_AMOUNT!,
  //   TRANSFER_FROM_PAYMENT_AMOUNT!
  // );
  // console.log("... TransferFrom deploy hash: ", transferfromDeployHash);

  // await getDeploy(NODE_ADDRESS!, transferfromDeployHash);
  // console.log("... Token transfer successfully");

};

//deploy();




