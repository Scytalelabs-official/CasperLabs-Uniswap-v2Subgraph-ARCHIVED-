import { config } from "dotenv";
config();
import { UniswapRouterClient, utils, constants } from "../src";
import { parseTokenMeta, sleep, getDeploy } from "./utils";
import { request } from 'graphql-request';

import {
	CLValueBuilder,
	Keys,
	CLPublicKey,
	CLAccountHash,
	CLPublicKeyType,
} from "casper-js-sdk";
import { isCombinedNodeFlagSet } from "tslint";

const { RouterEvents } = constants;

const {
	NODE_ADDRESS,
	EVENT_STREAM_ADDRESS,
	CHAIN_NAME,
	WASM_PATH,
	MASTER_KEY_PAIR_PATH,
	TOKEN_NAME,
	TOKEN_SYMBOL,
	FACTORY,
	WCSPR,
	LIBRARY,
	CONTRACT_NAME,
	CONTRACT_HASH,
	INSTALL_PAYMENT_AMOUNT,
	PAIR_CONTRACT,
	PAIR_CONTRACT_PACKAGE,
	TO,
	DEADLINE,

	// add_liquidity
	TOKEN_A,
	TOKEN_B,
	AMOUNT_A_DESIRED,
	AMOUNT_B_DESIRED,
	AMOUNT_A_MIN,
	AMOUNT_B_MIN,
	ADD_LIQUIDITY_PAYMENT_AMOUNT,

	// add_liquidity_cspr
	TOKEN,
	AMOUNT_TOKEN_DESIRED,
	AMOUNT_CSPR_DESIRED,
	AMOUNT_TOKEN_MIN,
	AMOUNT_CSPR_MIN,

	// remove_liquidity
	RL_TOKEN_A,
	RL_TOKEN_B,
	RL_LIQUIDITY,
	RL_AMOUNT_A_MIN,
	RL_AMOUNT_B_MIN,
	RL_TO,

	// remove_liquidity_cspr
	RLC_TOKEN,
	RLC_LIQUIDITY,
	RLC_AMOUNT_TOKEN_MIN,
	RLC_AMOUNT_CSPR_MIN,
	RLC_TO,

	// remove_liquidity_with_permit
	RLWP_TOKEN_A,
	RLWP_TOKEN_B,
	RLWP_LIQUIDITY,
	RLWP_AMOUNT_A_MIN,
	RLWP_AMOUNT_B_MIN,
	RLWP_TO,
	RLWP_APPROVE_MAX,
	RLWP_V,
	RLWP_R,
	RLWP_S,

	// remove_liquidity_cspr_with_permit
	RLCWP_TOKEN,
	RLCWP_LIQUIDITY,
	RLCWP_AMOUNT_TOKEN_MIN,
	RLCWP_AMOUNT_CSPR_MIN,
	RLCWP_TO,
	RLCWP_APPROVE_MAX,
	RLCWP_V,
	RLCWP_R,
	RLCWP_S,

	// swap_exact_token_for_token
	SETFT_AMOUNT_IN,
	SETFT_AMOUNT_OUT_MIN,
	SETFT_PATH,
	SETFT_TO,

	// swap_tokens_for_exact_tokens
	STFET_AMOUNT_OUT,
	STFET_AMOUNT_IN_MAX,
	STFET_PATH,
	STFET_TO,

	// swap_exact_cspr_for_tokens
	SECFT_AMOUNT_OUT_MIN,
	SECFT_AMOUNT_IN,
	SECFT_PATH,
	SECFT_TO,

	// swap_tokens_for_exact_cspr
	STFEC_AMOUNT_OUT,
	STFEC_AMOUNT_IN_MAX,
	STFEC_PATH,
	STFEC_TO,

	// swap_exact_tokens_for_cspr
	SETFC_AMOUNT_IN,
	SETFC_AMOUNT_OUT_MIN,
	SETFC_PATH,
	SETFC_TO,

	// swap_cspr_for_exact_tokens
	SCFET_AMOUNT_OUT,
	SCFET_AMOUNT_IN_MAX,
	SCFET_PATH,
	SCFET_TO,
	
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
	`${MASTER_KEY_PAIR_PATH}public_key.pem`,
	`${MASTER_KEY_PAIR_PATH}secret_key.pem`
);

const swap_cspr_for_exact_tokens_test = async (
	UniswapRouter: UniswapRouterClient
) => {
	let paths: string[] = SCFET_PATH!.split(",");

	return await UniswapRouter.swap_cspr_for_exact_tokens(
		KEYS,
		SCFET_AMOUNT_OUT!,
		SCFET_AMOUNT_IN_MAX!,
		paths,
		SCFET_TO!,
		DEADLINE!,
		INSTALL_PAYMENT_AMOUNT!
	);
};

const swap_exact_tokens_for_cspr_test = async (
	UniswapRouter: UniswapRouterClient
) => {
	let paths: string[] = SETFC_PATH!.split(",");
	return await UniswapRouter.swap_exact_tokens_for_cspr(
		KEYS,
		SETFC_AMOUNT_IN!,
		SETFC_AMOUNT_OUT_MIN!,
		paths,
		SETFC_TO!,
		DEADLINE!,
		INSTALL_PAYMENT_AMOUNT!
	);
};

const swap_tokens_for_exact_cspr_test = async (
	UniswapRouter: UniswapRouterClient
) => {
	let paths: string[] = STFEC_PATH!.split(",");
	return await UniswapRouter.swap_tokens_for_exact_cspr(
		KEYS,
		STFEC_AMOUNT_OUT!,
		STFEC_AMOUNT_IN_MAX!,
		paths,
		STFEC_TO!,
		DEADLINE!,
		INSTALL_PAYMENT_AMOUNT!
	);
};

const swap_exact_cspr_for_tokens_test = async (
	UniswapRouter: UniswapRouterClient
) => {
	let paths: string[] = SECFT_PATH!.split(",");
	return await UniswapRouter.swap_exact_cspr_for_tokens(
		KEYS,
		SECFT_AMOUNT_OUT_MIN!,
		SECFT_AMOUNT_IN!,
		paths,
		SECFT_TO!,
		DEADLINE!,
		INSTALL_PAYMENT_AMOUNT!
	);
};

const swap_tokens_for_exact_tokens_test = async (
	UniswapRouter: UniswapRouterClient
) => {
	let paths: string[] = STFET_PATH!.split(",");
	return await UniswapRouter.swap_tokens_for_exact_tokens(
		KEYS,
		STFET_AMOUNT_OUT!,
		STFET_AMOUNT_IN_MAX!,
		paths,
		STFET_TO!,
		DEADLINE!,
		INSTALL_PAYMENT_AMOUNT!
	);
};

const swap_exact_tokens_for_tokens_test = async (
	UniswapRouter: UniswapRouterClient
) => {
	let paths: string[] = SETFT_PATH!.split(",");
	
	return await UniswapRouter.swap_exact_tokens_for_tokens(
		KEYS,
		SETFT_AMOUNT_IN!,
		SETFT_AMOUNT_OUT_MIN!,
		paths,
		SETFT_TO!,
		DEADLINE!,
		INSTALL_PAYMENT_AMOUNT!
	);
};

const remove_liquidity_cspr_with_permit_test = async (
	UniswapRouter: UniswapRouterClient
) => {
	let approve_max: boolean = RLWP_APPROVE_MAX! == "true";

	return await UniswapRouter.remove_liquidity_cspr_with_permit(
		KEYS,
		RLCWP_TOKEN!,
		RLCWP_LIQUIDITY!,
		RLCWP_AMOUNT_TOKEN_MIN!,
		RLCWP_AMOUNT_CSPR_MIN!,
		RLCWP_TO!,
		DEADLINE!,
		approve_max,
		RLCWP_V!,
		RLCWP_R!,
		RLCWP_S!,
		INSTALL_PAYMENT_AMOUNT!
	);
};
const remove_liquidity_with_permit_test = async (
	uniswapRouter: UniswapRouterClient
) => {
	let approve_max: boolean = RLWP_APPROVE_MAX! == "true";

	return await uniswapRouter.remove_liquidity_with_permit(
		KEYS,
		RLWP_TOKEN_A!,
		RLWP_TOKEN_B!,
		RLWP_LIQUIDITY!,
		RLWP_AMOUNT_A_MIN!,
		RLWP_AMOUNT_B_MIN!,
		RLWP_TO!,
		DEADLINE!,
		approve_max,
		RLWP_V!,
		RLWP_R!,
		RLWP_S!,
		INSTALL_PAYMENT_AMOUNT!
	);
};

const add_liquidity_test = async (uniswapRouter: UniswapRouterClient) => {
	return await uniswapRouter.add_liquidity(
		KEYS,
		TOKEN_A!,
		TOKEN_B!,
		AMOUNT_A_DESIRED!,
		AMOUNT_B_DESIRED!,
		AMOUNT_A_MIN!,
		AMOUNT_B_MIN!,
		TO!,
		DEADLINE!,
		PAIR_CONTRACT_PACKAGE!,
		ADD_LIQUIDITY_PAYMENT_AMOUNT!
	);
};

const add_liquidity_cspr_test = async (uniswapRouter: UniswapRouterClient) => {
	return await uniswapRouter.add_liquidity_cspr(
		KEYS,
		TOKEN!,
		AMOUNT_TOKEN_DESIRED!,
		AMOUNT_CSPR_DESIRED!,
		AMOUNT_TOKEN_MIN!,
		AMOUNT_CSPR_MIN!,
		TO!,
		DEADLINE!,
		INSTALL_PAYMENT_AMOUNT!
	);
};

const remove_liquidity_test = async (uniswapRouter: UniswapRouterClient) => {
	return await uniswapRouter.remove_liquidity(
		KEYS,
		RL_TOKEN_A!,
		RL_TOKEN_B!,
		RL_LIQUIDITY!,
		RL_AMOUNT_A_MIN!,
		RL_AMOUNT_B_MIN!,
		RL_TO!,
		DEADLINE!,
		INSTALL_PAYMENT_AMOUNT!
	);
};
const remove_liquidity_cspr_test = async (
	uniswapRouter: UniswapRouterClient
) => {
	return await uniswapRouter.remove_liquidity_cspr(
		KEYS,
		RLC_TOKEN!,
		RLC_LIQUIDITY!,
		RLC_AMOUNT_TOKEN_MIN!,
		RLC_AMOUNT_CSPR_MIN!,
		RLC_TO!,
		DEADLINE!,
		INSTALL_PAYMENT_AMOUNT!
	);
};

const add_liquidity = async (uniswapRouter: UniswapRouterClient) => {
	const installDeployHash = await add_liquidity_test(uniswapRouter);
	console.log(`... add_liquidity deployHash: ${installDeployHash}\n`);

	await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log("add_liquidity function called successfully.");
};

const add_liquidity_cspr = async (uniswapRouter: UniswapRouterClient) => {
	const installDeployHash = await add_liquidity_cspr_test(uniswapRouter);
	console.log(`... add_liquidity_cspr deployHash: ${installDeployHash}\n`);

	await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log(`add_liquidity_cspr function called successfully`);
};

const remove_liquidity = async (uniswapRouter: UniswapRouterClient) => {
	const installDeployHash = await remove_liquidity_test(uniswapRouter);
	console.log(`... remove_liquidity deployHash: ${installDeployHash}\n`);

	await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log(`remove_liquidity function called successfully`);
};

const remove_liquidity_cspr = async (uniswapRouter: UniswapRouterClient) => {
	const installDeployHash = await remove_liquidity_cspr_test(uniswapRouter);
	console.log(`... remove_liquidity_cspr deployHash: ${installDeployHash}\n`);

	await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log(`remove_liquidity_cspr function called successfully`);
};

const remove_liquidity_with_permit = async (
	uniswapRouter: UniswapRouterClient
) => {
	const installDeployHash = await remove_liquidity_with_permit_test(
		uniswapRouter
	);
	console.log(
		`... remove_liquidity_with_permit deployHash: ${installDeployHash}\n`
	);

	await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log(`remove_liquidity_with_permit function called successfully`);
};

const remove_liquidity_cspr_with_permit = async (
	uniswapRouter: UniswapRouterClient
) => {
	const installDeployHash = await remove_liquidity_cspr_with_permit_test(
		uniswapRouter
	);
	console.log(
		`... remove_liquidity_cspr_with_permit deployHash: ${installDeployHash}\n`
	);

	await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log(`remove_liquidity_cspr_with_permit function called successfully`);
};

const swap_exact_tokens_for_tokens = async (
	uniswapRouter: UniswapRouterClient
) => {
	const installDeployHash = await swap_exact_tokens_for_tokens_test(
		uniswapRouter
	);
	console.log(
		`... swap_exact_tokens_for_tokens deployHash: ${installDeployHash}\n`
	);

	await sleep(7 * 1000);
	await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log(`swap_exact_tokens_for_tokens function called successfully`);
};

const swap_tokens_for_exact_tokens = async (
	uniswapRouter: UniswapRouterClient
) => {
	const installDeployHash = await swap_tokens_for_exact_tokens_test(
		uniswapRouter
	);
	console.log(
		`... swap_tokens_for_exact_tokens deployHash: ${installDeployHash}\n`
	);

	await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log(`swap_tokens_for_exact_tokens function called successfully`);
};

const swap_exact_cspr_for_tokens = async (
	uniswapRouter: UniswapRouterClient
) => {
	const installDeployHash = await swap_exact_cspr_for_tokens_test(
		uniswapRouter
	);
	console.log(
		`... swap_exact_cspr_for_tokens deployHash: ${installDeployHash}\n`
	);

	await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log(`swap_exact_cspr_for_tokens function called successfully`);
};

const swap_tokens_for_exact_cspr = async (
	uniswapRouter: UniswapRouterClient
) => {
	const installDeployHash = await swap_tokens_for_exact_cspr_test(
		uniswapRouter
	);
	console.log(
		`... swap_tokens_for_exact_cspr deployHash: ${installDeployHash}\n`
	);

	await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log(`swap_tokens_for_exact_cspr function called successfully`);
};

const swap_exact_tokens_for_cspr = async (
	uniswapRouter: UniswapRouterClient
) => {
	const installDeployHash = await swap_exact_tokens_for_cspr_test(
		uniswapRouter
	);
	console.log(
		`... swap_exact_tokens_for_cspr deployHash: ${installDeployHash}\n`
	);

	await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log(`swap_exact_tokens_for_cspr function called successfully`);
};

const swap_cspr_for_exact_tokens = async (
	uniswapRouter: UniswapRouterClient
) => {
	const installDeployHash = await swap_cspr_for_exact_tokens_test(
		uniswapRouter
	);
	console.log(
		`... swap_cspr_for_exact_tokens deployHash: ${installDeployHash}\n`
	);

	// await sleep(7 * 1000);
	// await getDeploy(NODE_ADDRESS!, installDeployHash);
	console.log(`swap_cspr_for_exact_tokens function called successfully`);
};

const uniswapRouter = new UniswapRouterClient(
	NODE_ADDRESS!,
	CHAIN_NAME!,
	EVENT_STREAM_ADDRESS!
);

const test = async () => {
 
	await uniswapRouter.setContractHash(CONTRACT_HASH!);
	
	// Test add_liquidity
	await add_liquidity(uniswapRouter);

	// Test add_liquidity_cspr
	//add_liquidity_cspr(uniswapRouter);

	// Test remove_liquidity
	// remove_liquidity(uniswapRouter);

	// Test remove_liquidity_cspr
	//remove_liquidity_cspr(uniswapRouter);

	// Test remove_liquidity_with_permit
	//remove_liquidity_with_permit(uniswapRouter);

	// Test remove_liquidity_cspr_with_permit
	//remove_liquidity_cspr_with_permit(uniswapRouter);

	// Test swap_exact_tokens_for_tokens
	//swap_exact_tokens_for_tokens(uniswapRouter);

	// Test swap_tokens_for_exact_tokens
	//swap_tokens_for_exact_tokens(uniswapRouter);

	// Test swap_exact_cspr_for_tokens
	//swap_exact_cspr_for_tokens(uniswapRouter);

	// Test swap_tokens_for_exact_cspr
	//swap_tokens_for_exact_cspr(uniswapRouter);

	// Test swap_exact_tokens_for_cspr
	//swap_exact_tokens_for_cspr(uniswapRouter);

	//Test swap_cspr_for_exact_tokens
	// swap_cspr_for_exact_tokens(uniswapRouter);

	// let register = await uniswapRouter.registerWebHook(
	// 	"http://localhost:5000/",
	// 	"http://localhost:5000/mockserver"
	// );
	// console.log(`... Register Endpoint: ${register}`);

	// let createPair = await uniswapRouter.CreatePairApi(
	// 	"c9d0268ecea8c57ed456bf56e4fba4bf285a4588fd817832230b8fd86b71c30f",
	// 	"fbfeda8b97f056f526f20c2fc2b486d9bdbfb3e46b9a164527e57c0c86e68612"
	// );
	// console.log(`... Create Pair Endpoint: ${createPair}`);
  
};

//test();

export const swapforinterface = async (
	signerkey:string,
	amountin: string,
	amountout: string,
	paths:string[],
	to:string,
	deadline:string,
	installpaymentamount:string
) => {

	await uniswapRouter.setContractHash(CONTRACT_HASH!);
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