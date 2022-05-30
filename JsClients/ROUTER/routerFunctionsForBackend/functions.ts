import { config } from "dotenv";
config();
import { UniswapRouterClient } from "../src";

const {
	NODE_ADDRESS,
	EVENT_STREAM_ADDRESS,
	CHAIN_NAME,
	ROUTER_CONTRACT_HASH
} = process.env;


const uniswapRouter = new UniswapRouterClient(
	NODE_ADDRESS!,
	CHAIN_NAME!,
	EVENT_STREAM_ADDRESS!
);

export const swapforinterface = async (
	signerkey:string,
	amountin: string,
	amountout: string,
	paths:string[],
	to:string,
	deadline:string,
	installpaymentamount:string
) => {

	await uniswapRouter.setContractHash(ROUTER_CONTRACT_HASH!);
	console.log("key:",signerkey);
	const deploy = await uniswapRouter.swap_exact_tokens_for_tokensinterface(
		signerkey,
		amountin,
		amountout,
		paths,
		to,
		deadline,
		installpaymentamount
	);

	console.log(`... Swap make deploy SuccessFull: ${deploy}`);
	return deploy;
  
};