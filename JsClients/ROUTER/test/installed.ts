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

	TO,
	DEADLINE,

	// add_liquidity
	TOKEN_A,
	TOKEN_B,
	AMOUNT_A_DESIRED,
	AMOUNT_B_DESIRED,
	AMOUNT_A_MIN,
	AMOUNT_B_MIN,

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

	GRAPHQL
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
		INSTALL_PAYMENT_AMOUNT!
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
	console.log(`add_liquidity function called successfully`);
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

function splitdata(data:string)
{
    var temp=data.split('(');
    var result=temp[1].split(')');
    return result[0];
}

const test = async () => {
	const uniswapRouter = new UniswapRouterClient(
		NODE_ADDRESS!,
		CHAIN_NAME!,
		EVENT_STREAM_ADDRESS!
	);

	const listener = uniswapRouter.onEvent(
		[
			RouterEvents.PairCreated,
			RouterEvents.Transfer,
			RouterEvents.Approval,
			RouterEvents.Mint,
			RouterEvents.Burn,
			RouterEvents.Sync,
			RouterEvents.Swap
		],
		async (eventName, deploy, result) => {
			if (deploy.success) {
				console.log(`Successfull deploy of: ${eventName}, deployHash: ${deploy.deployHash}`);
				const [timestamp,block_hash]= await getDeploy(NODE_ADDRESS!, deploy.deployHash);
				console.log("... Deployhash: ",  deploy.deployHash);
				console.log("... Timestamp: ", timestamp);
				console.log("... Block hash: ", block_hash);
				console.log("result.value(): ",result.value());
				let newData = JSON.parse(JSON.stringify(result.value()));

				if(eventName =="pair_created")
				{
					console.log(eventName+ " Event result: ");
					console.log(newData[0][0].data + " = " + newData[0][1].data);
					console.log(newData[1][0].data + " = " + newData[1][1].data);
					console.log(newData[2][0].data + " = " + newData[2][1].data);
					console.log(newData[3][0].data + " = " + newData[3][1].data);
					console.log(newData[4][0].data + " = " + newData[4][1].data);
					console.log(newData[5][0].data + " = " + newData[5][1].data);
					
					var allpairslength=parseInt(newData[0][1].data);
					var pair=splitdata(newData[3][1].data);
					var token0=splitdata(newData[4][1].data);
					var token1=splitdata(newData[5][1].data);
					
					console.log("allpairslength: ", allpairslength);
					console.log("pair splited: ", pair);
					console.log("token0 splited: ", token0);
					console.log("token1 splited: ", token1);

					request(GRAPHQL!,
					`mutation handleNewPair( $token0: String!, $token1: String!, $pair: String!, $all_pairs_length: Int!, $timeStamp: String!, $blockHash: String!){
					handleNewPair( token0: $token0, token1: $token1, pair: $pair, all_pairs_length: $all_pairs_length, timeStamp: $timeStamp, blockHash: $blockHash) {
					result
					}
				
					}`,
					{token0:token0, token1:token1, pair: pair, all_pairs_length: allpairslength, timeStamp:timestamp.toString(), blockHash:block_hash})
					.then(data => console.log(data))
					.catch(error => console.error(error));
				}
				else if(eventName=="approve")
				{
					console.log(eventName+ " Event result: ");
					console.log(newData[0][0].data + " = " + newData[0][1].data);
					console.log(newData[1][0].data + " = " + newData[1][1].data);
					console.log(newData[2][0].data + " = " + newData[2][1].data);
					console.log(newData[3][0].data + " = " + newData[3][1].data);
					console.log(newData[4][0].data + " = " + newData[4][1].data);
				}
				else if(eventName=="transfer")
					{
					console.log(eventName+ " Event result: ");
					console.log(newData[0][0].data + " = " + newData[0][1].data);
					console.log(newData[1][0].data + " = " + newData[1][1].data);

					console.log(newData[2][0].data + " = " + newData[2][1].data);
					console.log(newData[3][0].data + " = " + newData[3][1].data);
					console.log(newData[4][0].data + " = " + newData[4][1].data);
					console.log(newData[5][0].data + " = " + newData[5][1].data);

					var from=splitdata(newData[2][1].data);
					var to=splitdata(newData[4][1].data);
					var value=parseInt(newData[5][1].data);
					var pair=splitdata(newData[3][1].data);

					console.log("from: ", from);
					console.log("to: ", to);
					console.log("value: ",value);
					console.log("pair: ", pair);

					request(GRAPHQL!,
						`mutation handleTransfer( $from: String!, $to: String!, $value: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
						handleTransfer( from: $from, to: $to, value: $value, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
						result
						}
					
						}`,
						{from:from, to: to, value: value, pairAddress: pair, deployHash:deploy.deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
						.then(data => console.log(data))
						.catch(error => console.error(error));
					}
					else if (eventName=="mint")
					{

					console.log(eventName+ " Event result: ");
					console.log(newData[0][0].data + " = " + newData[0][1].data);
					console.log(newData[1][0].data + " = " + newData[1][1].data);
					console.log(newData[2][0].data + " = " + newData[2][1].data);
					console.log(newData[3][0].data + " = " + newData[3][1].data);
					console.log(newData[4][0].data + " = " + newData[4][1].data);
					console.log(newData[5][0].data + " = " + newData[5][1].data);

					var amount0=parseInt(newData[0][1].data);
					var amount1=parseInt(newData[1][1].data);
					var pair=splitdata(newData[4][1].data);
					var sender=splitdata(newData[5][1].data);

					console.log("amount0: ", amount0);
					console.log("amount1: ", amount1);
					console.log("pair: ",pair);
					console.log("sender: ", sender);

					request(GRAPHQL!,
						`mutation handleMint( $amount0: Int!, $amount1: Int!, $sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
						handleMint( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
							result
						}
						
						}`,
						{amount0:amount0, amount1: amount1, sender: sender,logIndex:0, pairAddress: pair, deployHash:deploy.deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
						.then(data => console.log(data))
						.catch(error => console.error(error));
					}
					else if (eventName=="burn")
					{

					console.log(eventName+ " Event result: ");
					console.log(newData[0][0].data + " = " + newData[0][1].data);
					console.log(newData[1][0].data + " = " + newData[1][1].data);
					console.log(newData[2][0].data + " = " + newData[2][1].data);
					console.log(newData[3][0].data + " = " + newData[3][1].data);
					console.log(newData[4][0].data + " = " + newData[4][1].data);
					console.log(newData[5][0].data + " = " + newData[5][1].data);
					console.log(newData[6][0].data + " = " + newData[6][1].data);
					
					var amount0=parseInt(newData[0][1].data);
					var amount1=parseInt(newData[1][1].data);
					var pair=splitdata(newData[4][1].data);
					var sender=splitdata(newData[5][1].data);
					var to=splitdata(newData[6][1].data);

					console.log("amount0: ", amount0);
					console.log("amount1: ", amount1);
					console.log("pair: ",pair);
					console.log("sender: ", sender);
					console.log("to: ", to);

					request(GRAPHQL!,
						`mutation handleBurn( $amount0: Int!, $amount1: Int!, $sender: String!,$logIndex: Int!,$to: String!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
						handleBurn( amount0: $amount0, amount1: $amount1, sender: $sender, logIndex: $logIndex, to:$to, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
							result
						}
						
						}`,
						{amount0:amount0, amount1: amount1, sender: sender,logIndex:0, to:to,pairAddress: pair, deployHash:deploy.deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
						.then(data => console.log(data))
						.catch(error => console.error(error));
					}
					else if (eventName=="sync")
					{

					console.log(eventName+ " Event result: ");
					console.log(newData[0][0].data + " = " + newData[0][1].data);
					console.log(newData[1][0].data + " = " + newData[1][1].data);
					console.log(newData[2][0].data + " = " + newData[2][1].data);
					console.log(newData[3][0].data + " = " + newData[3][1].data);
					console.log(newData[4][0].data + " = " + newData[4][1].data);

					var reserve0=parseInt(newData[3][1].data);
					var reserve1=parseInt(newData[4][1].data);
					var pair=splitdata(newData[2][1].data);

					console.log("reserve0: ", reserve0);
					console.log("reserve1: ", reserve1);
					console.log("pair: ",pair);
					

					request(GRAPHQL!,
						`mutation handleSync( $reserve0: Int!, $reserve1: Int!, $pairAddress: String!){
						handleSync( reserve0: $reserve0, reserve1: $reserve1, pairAddress: $pairAddress) {
						result
						}
					
						}`,
						{reserve0:reserve0, reserve1: reserve1, pairAddress: pair})
						.then(data => console.log(data))
						.catch(error => console.error(error));
					}
					else if (eventName=="swap")
					{

					console.log(eventName+ " Event result: ");
					console.log(newData[0][0].data + " = " + newData[0][1].data);
					console.log(newData[1][0].data + " = " + newData[1][1].data);
					console.log(newData[2][0].data + " = " + newData[2][1].data);
					console.log(newData[3][0].data + " = " + newData[3][1].data);
					console.log(newData[4][0].data + " = " + newData[4][1].data);
					console.log(newData[5][0].data + " = " + newData[5][1].data);
					console.log(newData[6][0].data + " = " + newData[6][1].data);
					console.log(newData[7][0].data + " = " + newData[7][1].data);
					console.log(newData[8][0].data + " = " + newData[8][1].data);
					console.log(newData[9][0].data + " = " + newData[9][1].data);

					var amount0In=parseInt(newData[0][1].data);
					var amount1In=parseInt(newData[1][1].data);
					var amount0Out=parseInt(newData[2][1].data);
					var amount1Out=parseInt(newData[3][1].data);
					var from=splitdata(newData[6][1].data);
					var pair=splitdata(newData[7][1].data);
					var sender=splitdata(newData[8][1].data);
					var to=splitdata(newData[9][1].data);

					console.log("amount0In: ", amount0In);
					console.log("amount1In: ", amount1In);
					console.log("amount0Out: ", amount0Out);
					console.log("amount1Out: ", amount1Out);
					console.log("from: ",from);
					console.log("pair: ",pair);
					console.log("sender: ", sender);
					console.log("to: ", to);

					request(GRAPHQL!,
						`mutation handleSwap( $amount0In: Int!, $amount1In: Int!, $amount0Out: Int!, $amount1Out: Int!, $to: String!,$from: String!,$sender: String!,$logIndex: Int!, $pairAddress: String!, $deployHash: String!, $timeStamp: String!, $blockHash: String!){
						handleSwap( amount0In: $amount0In, amount1In: $amount1In, amount0Out: $amount0Out, amount1Out: $amount1Out, to:$to, from:$from,sender: $sender,logIndex: $logIndex, pairAddress: $pairAddress, deployHash: $deployHash, timeStamp: $timeStamp, blockHash: $blockHash) {
							result
						}
						
						}`,
						{amount0In:amount0In, amount1In: amount1In,amount0Out:amount0Out, amount1Out: amount1Out,to:to,from:from, sender: sender,logIndex:0,pairAddress: pair, deployHash:deploy.deployHash,timeStamp:timestamp.toString(), blockHash:block_hash})
						.then(data => console.log(data))
						.catch(error => console.error(error));
					}
			} else {
				console.log(
					`Failed deploy of ${eventName}, deployHash: ${deploy.deployHash}`
				);
				console.log(`Error: ${deploy.error}`);
			}
		}
	);
	// await sleep(5 * 1000);

	// let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

	// console.log(`... Account Info: `);
	// console.log(JSON.stringify(accountInfo, null, 2));

	// const contractHash = await utils.getAccountNamedKeyValue(
	// 	accountInfo,
	// 	"UniSwapRouter_contract_hash"
	// );

	// console.log(`... Contract Hash: ${contractHash}`);

	// await uniswapRouter.setContractHash(contractHash.slice(5));

	// Test add_liquidity
	//add_liquidity(uniswapRouter);

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
