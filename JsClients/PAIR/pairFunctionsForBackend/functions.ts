import { config } from "dotenv";
config();
import { PAIRClient} from "../src";

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  PAIR_CONTRACT_NAME,
  PAIR_TOKEN_NAME,
  PAIR_TOKEN_SYMBOL,
  PAIR_DECIMALS,
  PAIR_TOTAL_SUPPLY,
  PAIR_INSTALL_PAYMENT_AMOUNT,
  PAIR_WASM_PATH,
} = process.env;


const pair = new PAIRClient(
  NODE_ADDRESS!,
  CHAIN_NAME!,
  EVENT_STREAM_ADDRESS!
);

export const balanceOf = async (contractHash:string, key:string) => {
  
  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  await pair.setContractHash(contractHash);

 //balanceof
  let balance = await pair.balanceOf(key);

  console.log(`... Balance: ${balance}`);

  return balance;

};
export const allowance = async (contractHash:string, ownerkey:string, spenderkey:string) => {
  
  console.log(`... Contract Hash: ${contractHash}`);

  // We don't need hash- prefix so i'm removing it
  await pair.setContractHash(contractHash);

  let allowance = await pair.allowance(ownerkey,spenderkey);

  console.log(`... Allowance: ${allowance}`);

  return allowance;

};

export const makedeploypaircontract = async (
	FACTORY_CONTRACT_PACKAGE: string,
	CALLEE_PACKAGE: string,
	signerkey:string,
) => {
	
	const deployJSON = await pair.makedeployJSON(
		signerkey,
    PAIR_CONTRACT_NAME!,
    PAIR_TOKEN_NAME!,
    PAIR_TOKEN_SYMBOL!,
    PAIR_DECIMALS!,
    PAIR_TOTAL_SUPPLY!,
    FACTORY_CONTRACT_PACKAGE!,
    CALLEE_PACKAGE!,
    PAIR_INSTALL_PAYMENT_AMOUNT!,
    PAIR_WASM_PATH!
	);

	console.log(`... Contract make deploy SuccessFull: ${deployJSON}`);
	return deployJSON;
  
};
