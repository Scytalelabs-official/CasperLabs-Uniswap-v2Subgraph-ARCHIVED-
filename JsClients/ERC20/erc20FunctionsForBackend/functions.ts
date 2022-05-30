import { config } from "dotenv";
config();
import { ERC20Client} from "../src";

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME
} = process.env;

const erc20 = new ERC20Client(
  NODE_ADDRESS!,
  CHAIN_NAME!,
  EVENT_STREAM_ADDRESS!
);

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
