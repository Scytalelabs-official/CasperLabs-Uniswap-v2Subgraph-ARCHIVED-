import {
	CasperClient,
	CLPublicKey,
	CLAccountHash,
	CLByteArray,
	CLKey,
	CLString,
	CLTypeBuilder,
	CLValue,
	CLValueBuilder,
	CLValueParsers,
	CLMap,
	DeployUtil,
	EventName,
	EventStream,
	Keys,
	RuntimeArgs,
	CLKeyParameters,
	CLKeyType,
	CLList,
	CLBoolBytesParser,
	CLOption,
	CLOptionType
} from "casper-js-sdk";
import { Some, None } from "ts-results";
import { RouterEvents } from "./constants";
import * as utils from "./utils";
import { RecipientType, IPendingDeploy } from "./types";
import { ContractType } from "casper-js-sdk/dist/lib/DeployUtil";
import { Key } from "readline";
const axios = require("axios").default;

class UniswapRouterClient {
	private contractName: string = "uniswap_router";
	private contractHash: string= "uniswap_router"; // Hash type is string
	private contractPackageHash: string= "uniswap_router";
	private namedKeys: {
		balances: string;
		metadata: string;
		ownedTokens: string;
		owners: string;
		paused: string;
	};
	private isListening = false;
	private pendingDeploys: IPendingDeploy[] = [];

	constructor(
		private nodeAddress: string,
		private chainName: string,
		private eventStreamAddress?: string
	) {
		this.namedKeys= {
		  balances:"null",
		  metadata: "null",
		  ownedTokens: "null",
		  owners: "null",
		  paused: "null"
		}; 
	}

	public async install(
		keys: Keys.AsymmetricKey, // Have Public/Private Key Pair
		factory: string,
		wcspr: string,
		library: string,
		_contract_name: string,
		paymentAmount: string,
		wasmPath: string
	) {
		// convert string addresses to 8 bits hex arrays
		const _factory = new CLByteArray(
			Uint8Array.from(Buffer.from(factory, "hex"))
		);
		const _wcspr = new CLByteArray(Uint8Array.from(Buffer.from(wcspr, "hex")));
		const _library = new CLByteArray(
			Uint8Array.from(Buffer.from(library, "hex"))
		);

		const runtimeArgs = RuntimeArgs.fromMap({
			factory: CLValueBuilder.key(_factory),
			wcspr: CLValueBuilder.key(_wcspr),
			library: CLValueBuilder.key(_library),
			contract_name: CLValueBuilder.string(_contract_name),
		});

		const deployHash = await installWasmFile({
			chainName: this.chainName,
			paymentAmount,
			nodeAddress: this.nodeAddress,
			keys,
			pathToContract: wasmPath,
			runtimeArgs,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Problem with installation");
		}
	}

	public async setContractHash(hash: string) {
		const stateRootHash = await utils.getStateRootHash(this.nodeAddress);
		const contractData = await utils.getContractData(
		  this.nodeAddress,
		  stateRootHash,
		  hash
		);
	
		const { contractPackageHash, namedKeys } = contractData.Contract!;
		this.contractHash = hash;
		this.contractPackageHash = contractPackageHash.replace(
		  "contract-package-wasm",
		  ""
		);
		const LIST_OF_NAMED_KEYS = [
		  `${this.contractName}_package_hash`,
		  `${this.contractName}_package_hash_wrapped`,
		  `${this.contractName}_contract_hash`,
		  `${this.contractName}_contract_hash_wrapped`,
		  `${this.contractName}_package_access_token`,
		];
		// @ts-ignore
		this.namedKeys = namedKeys.reduce((acc, val) => {
		  if (LIST_OF_NAMED_KEYS.includes(val.name)) {
			return { ...acc, [utils.camelCased(val.name)]: val.key };
		  }
		  return acc;
		}, {});
	  }

	// using string instead of 'number' because number is 64 bit in TS, we need 256 bits
	public async add_liquidity(
		keys: Keys.AsymmetricKey,
		token_a: string,
		token_b: string,
		amount_a_desired: string,
		amount_b_desired: string,
		amount_a_min: string,
		amount_b_min: string,
		to: string,
		deadline: string,
		pair_hash:string,
		paymentAmount: string
	) {
		const _token_a = new CLByteArray(
			Uint8Array.from(Buffer.from(token_a, "hex"))
		);
		const _token_b = new CLByteArray(
			Uint8Array.from(Buffer.from(token_b, "hex"))
		);
		const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, "hex")));

		const pair = new CLByteArray(
			Uint8Array.from(Buffer.from(pair_hash, "hex"))
		);

		const runtimeArgs = RuntimeArgs.fromMap({
			token_a: new CLKey(_token_a),
			token_b: new CLKey(_token_b),
			amount_a_desired: CLValueBuilder.u256(amount_a_desired),
			amount_b_desired: CLValueBuilder.u256(amount_b_desired),
			amount_a_min: CLValueBuilder.u256(amount_a_min),
			amount_b_min: CLValueBuilder.u256(amount_b_min),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
			pair: new CLOption(Some(new CLKey(pair)))
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "add_liquidity_js_client",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	
	public async add_liquidity_cspr(
		keys: Keys.AsymmetricKey,
		token: string,
		amount_token_desired: string,
		amount_cspr_desired: string,
		amount_token_min: string,
		amount_cspr_min: string,
		to: string,
		deadline: string,
		paymentAmount: string
	) {
		const _token = new CLByteArray(Uint8Array.from(Buffer.from(token, "hex")));
		const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, "hex")));

		const runtimeArgs = RuntimeArgs.fromMap({
			token: new CLKey(_token),
			amount_token_desired: CLValueBuilder.u256(amount_token_desired),
			amount_cspr_desired: CLValueBuilder.u256(amount_cspr_desired),
			amount_token_min: CLValueBuilder.u256(amount_token_min),
			amount_cspr_min: CLValueBuilder.u256(amount_cspr_min),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "add_liquidity_cspr",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {
			
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public async remove_liquidity(
		keys: Keys.AsymmetricKey,
		token_a: string,
		token_b: string,
		liquidity: string,
		amount_a_min: string,
		amount_b_min: string,
		to: string,
		deadline: string,
		paymentAmount: string
	) {
		const _token_a = new CLByteArray(
			Uint8Array.from(Buffer.from(token_a, "hex"))
		);
		const _token_b = new CLByteArray(
			Uint8Array.from(Buffer.from(token_b, "hex"))
		);
		const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, "hex")));

		const runtimeArgs = RuntimeArgs.fromMap({
			token_a: new CLKey(_token_a),
			token_b: new CLKey(_token_b),
			liquidity: CLValueBuilder.u256(liquidity),
			amount_a_min: CLValueBuilder.u256(amount_a_min),
			amount_b_min: CLValueBuilder.u256(amount_b_min),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "remove_liquidity",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {
			
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public async remove_liquidity_cspr(
		keys: Keys.AsymmetricKey,
		token: string,
		liquidity: string,
		amount_token_min: string,
		amount_cspr_min: string,
		to: string,
		deadline: string,
		paymentAmount: string
	) {
		const _token = new CLByteArray(Uint8Array.from(Buffer.from(token, "hex")));
		const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, "hex")));

		const runtimeArgs = RuntimeArgs.fromMap({
			token: new CLKey(_token),
			liquidity: CLValueBuilder.u256(liquidity),
			amount_token_min: CLValueBuilder.u256(amount_token_min),
			amount_cspr_min: CLValueBuilder.u256(amount_cspr_min),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "remove_liquidity_cspr",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {
			
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	// Buffer.from(string) but it converts the string, we want the actual bytes value from something..
	public async remove_liquidity_with_permit(
		keys: Keys.AsymmetricKey,
		token_a: string,
		token_b: string,
		liquidity: string,
		amount_a_min: string,
		amount_b_min: string,
		to: string,
		deadline: string,
		approve_max: boolean,
		v: string,
		r: string,
		s: string,
		paymentAmount: string
	) {
		const _token_a = new CLByteArray(
			Uint8Array.from(Buffer.from(token_a, "hex"))
		);
		const _token_b = new CLByteArray(
			Uint8Array.from(Buffer.from(token_b, "hex"))
		);
		const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, "hex")));

		const runtimeArgs = RuntimeArgs.fromMap({
			token_a: new CLKey(_token_a),
			token_b: new CLKey(_token_b),
			liquidity: CLValueBuilder.u256(liquidity),
			amount_a_min: CLValueBuilder.u256(amount_a_min),
			amount_b_min: CLValueBuilder.u256(amount_b_min),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
			approve_max: CLValueBuilder.bool(approve_max),
			v: CLValueBuilder.u8(v),
			r: CLValueBuilder.u32(r),
			s: CLValueBuilder.u32(s),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "remove_liquidity_with_permit",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {
		
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public async remove_liquidity_cspr_with_permit(
		keys: Keys.AsymmetricKey,
		token: string,
		liquidity: string,
		amount_token_min: string,
		amount_cspr_min: string,
		to: string,
		deadline: string,
		approve_max: boolean,
		v: string,
		r: string,
		s: string,
		paymentAmount: string
	) {
		const _token = new CLByteArray(Uint8Array.from(Buffer.from(token, "hex")));
		const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, "hex")));

		const runtimeArgs = RuntimeArgs.fromMap({
			token: new CLKey(_token),
			liquidity: CLValueBuilder.u256(liquidity),
			amount_token_min: CLValueBuilder.u256(amount_token_min),
			amount_cspr_min: CLValueBuilder.u256(amount_cspr_min),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
			approve_max: CLValueBuilder.bool(approve_max),
			v: CLValueBuilder.u8(v),
			r: CLValueBuilder.u32(r),
			s: CLValueBuilder.u32(s),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "remove_liquidity_cspr_with_permit",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {
			
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public async swap_exact_tokens_for_tokens(
		keys: Keys.AsymmetricKey,
		amount_in: string,
		amount_out_min: string,
		path: string[],
		to: string,
		deadline: string,
		paymentAmount: string
	) {
		console.log("Path : ", path);
		// console.log("Path (before): ", path[0]);
		// console.log("to (before): ", to);

		// MAPPED THIS ACCORDING TO UTIL createRecipientAddress function
		let _paths: CLKey[] = [];
		for (let i = 0; i < path.length; i++) {
			const p = new CLByteArray(Uint8Array.from(Buffer.from(path[i], "hex")));
			_paths.push(utils.createRecipientAddress(p));
		}

		const _to = CLPublicKey.fromHex(to);

		const runtimeArgs = RuntimeArgs.fromMap({
			amount_in: CLValueBuilder.u256(amount_in),
			amount_out_min: CLValueBuilder.u256(amount_out_min),
			path: new CLList(_paths),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "swap_exact_tokens_for_tokens_js_client",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {

			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async swap_exact_tokens_for_tokensinterface(
		keys: string,
		amount_in: string,
		amount_out_min: string,
		path: string[],
		to: string,
		deadline: string,
		paymentAmount: string
	) {
		console.log("Path : ", path);
	
		
		const tokena = new CLByteArray(Uint8Array.from(Buffer.from(path[0], "hex")));
		const tokenb = new CLByteArray(Uint8Array.from(Buffer.from(path[1], "hex")));
		const _to = CLPublicKey.fromHex(to);

		const runtimeArgs = RuntimeArgs.fromMap({
			amount_in: CLValueBuilder.u256(amount_in),
			amount_out_min: CLValueBuilder.u256(amount_out_min),
			token_a:utils.createRecipientAddress(tokena),
			token_b:utils.createRecipientAddress(tokenb),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
		});

		const deployHash = await contractCallinterface({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "swap_exact_tokens_for_tokens_js_client",
			keys,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {

			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}
	public async swap_tokens_for_exact_tokens(
		keys: Keys.AsymmetricKey,
		amount_out: string,
		amount_in_max: string,
		path: string[],
		to: string,
		deadline: string,
		paymentAmount: string
	) {
		let _paths: CLKey[] = [];
		for (let i = 0; i < path.length; i++) {
			const p = new CLByteArray(Uint8Array.from(Buffer.from(path[i], "hex")));
			_paths.push(utils.createRecipientAddress(p));
		}

		const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, "hex")));

		const runtimeArgs = RuntimeArgs.fromMap({
			amount_out: CLValueBuilder.u256(amount_out),
			amount_in_max: CLValueBuilder.u256(amount_in_max),
			path: CLValueBuilder.list(_paths),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "swap_tokens_for_exact_tokens",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {
			
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public async swap_exact_cspr_for_tokens(
		keys: Keys.AsymmetricKey,
		amount_out_min: string,
		amount_in: string,
		path: string[],
		to: string,
		deadline: string,
		paymentAmount: string
	) {
		let _paths: CLKey[] = [];
		for (let i = 0; i < path.length; i++) {
			const p = new CLByteArray(Uint8Array.from(Buffer.from(path[i], "hex")));
			_paths.push(utils.createRecipientAddress(p));
		}
		const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, "hex")));

		const runtimeArgs = RuntimeArgs.fromMap({
			amount_out_min: CLValueBuilder.u256(amount_out_min),
			amount_in: CLValueBuilder.u256(amount_in),
			path: CLValueBuilder.list(_paths),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "swap_exact_cspr_for_tokens",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {
			
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public async swap_tokens_for_exact_cspr(
		keys: Keys.AsymmetricKey,
		amount_out: string,
		amount_in_max: string,
		path: string[],
		to: string,
		deadline: string,
		paymentAmount: string
	) {
		let _paths: CLKey[] = [];
		for (let i = 0; i < path.length; i++) {
			const p = new CLByteArray(Uint8Array.from(Buffer.from(path[i], "hex")));
			_paths.push(utils.createRecipientAddress(p));
		}
		const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, "hex")));

		const runtimeArgs = RuntimeArgs.fromMap({
			amount_out: CLValueBuilder.u256(amount_out),
			amount_in_max: CLValueBuilder.u256(amount_in_max),
			path: CLValueBuilder.list(_paths),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "swap_tokens_for_exact_cspr",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {
		
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public async swap_exact_tokens_for_cspr(
		keys: Keys.AsymmetricKey,
		amount_in: string,
		amount_out_min: string,
		path: string[],
		to: string,
		deadline: string,
		paymentAmount: string
	) {
		let _paths: CLKey[] = [];
		for (let i = 0; i < path.length; i++) {
			const p = new CLByteArray(Uint8Array.from(Buffer.from(path[i], "hex")));
			_paths.push(utils.createRecipientAddress(p));
		}
		const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, "hex")));

		const runtimeArgs = RuntimeArgs.fromMap({
			amount_in: CLValueBuilder.u256(amount_in),
			amount_out_min: CLValueBuilder.u256(amount_out_min),
			path: CLValueBuilder.list(_paths),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "swap_exact_tokens_for_cspr",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {
		
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public async swap_cspr_for_exact_tokens(
		keys: Keys.AsymmetricKey,
		amount_out: string,
		amount_in_max: string,
		path: string[],
		to: string,
		deadline: string,
		paymentAmount: string
	) {
		let _paths: CLKey[] = [];
		console.log("Output\n");

		for (let i = 0; i < path.length; i++) {
			const p = new CLByteArray(Uint8Array.from(Buffer.from(path[i], "hex")));
			_paths.push(utils.createRecipientAddress(p));
		}

		const _to = new CLByteArray(Uint8Array.from(Buffer.from(to, "hex")));
		console.log("To: ", utils.createRecipientAddress(_to));
		console.log(
			"Path:\n",
			CLValueBuilder.list(CLValueBuilder.list(_paths).data)
		);

		const runtimeArgs = RuntimeArgs.fromMap({
			amount_out: CLValueBuilder.u256(amount_out),
			amount_in_max: CLValueBuilder.u256(amount_in_max),
			path: CLValueBuilder.list(CLValueBuilder.list(_paths).data),
			to: utils.createRecipientAddress(_to),
			deadline: CLValueBuilder.u256(deadline),
		});

		const deployHash = await contractCall({
			chainName: this.chainName,
			contractHash: this.contractHash,
			entryPoint: "swap_cspr_for_exact_tokens",
			keys,
			nodeAddress: this.nodeAddress,
			paymentAmount,
			runtimeArgs,
		});

		if (deployHash !== null) {
		
			return deployHash;
		} else {
			throw Error("Invalid Deploy");
		}
	}

	public onEvent(
		eventNames: RouterEvents[],
		callback: (
		  eventName: RouterEvents,
		  deployStatus: {
			deployHash: string;
			success: boolean;
			error: string | null;
		  },
		  result: any | null
		) => void
	  ): any {
		if (!this.eventStreamAddress) {
		  throw Error("Please set eventStreamAddress before!");
		}
		if (this.isListening) {
		  throw Error(
			"Only one event listener can be create at a time. Remove the previous one and start new."
		  );
		}
		const es = new EventStream(this.eventStreamAddress);
		this.isListening = true;
	
		es.subscribe(EventName.DeployProcessed, (value: any) => {
		  const deployHash = value.body.DeployProcessed.deploy_hash;
	
		  const pendingDeploy = this.pendingDeploys.find(
			(pending) => pending.deployHash === deployHash
		  );
	
		  if (!pendingDeploy) {
			return;
		  }
	
		  if (
			!value.body.DeployProcessed.execution_result.Success &&
			value.body.DeployProcessed.execution_result.Failure
		  ) {
			callback(
			  pendingDeploy.deployType,
			  {
				deployHash,
				error:
				  value.body.DeployProcessed.execution_result.Failure.error_message,
				success: false,
			  },
			  null
			);
		  } else {
			const { transforms } =
			  value.body.DeployProcessed.execution_result.Success.effect;
	
			const RouterEvents = transforms.reduce((acc: any, val: any) => {
			  if (
				val.transform.hasOwnProperty("WriteCLValue") &&
				typeof val.transform.WriteCLValue.parsed === "object" &&
				val.transform.WriteCLValue.parsed !== null
			  ) {
				const maybeCLValue = CLValueParsers.fromJSON(
				  val.transform.WriteCLValue
				);
				const clValue = maybeCLValue.unwrap();
				if (clValue && clValue instanceof CLMap) {
				  const hash = clValue.get(
					CLValueBuilder.string("contract_package_hash")
				  );
				  const event = clValue.get(CLValueBuilder.string("event_type"));
				  if (
					hash &&
					// NOTE: Calling toLowerCase() because current JS-SDK doesn't support checksumed hashes and returns all lower case value
					// Remove it after updating SDK
					hash.value() === this.contractPackageHash.toLowerCase() &&
					event &&
					eventNames.includes(event.value())
				  ) {
					acc = [...acc, { name: event.value(), clValue }];
				  }
				}
			  }
			  return acc;
			}, []);
	
			RouterEvents.forEach((d: any) =>
			  callback(
				d.name,
				{ deployHash, error: null, success: true },
				d.clValue
			  )
			);
		  }
	
		  this.pendingDeploys = this.pendingDeploys.filter(
			(pending) => pending.deployHash !== deployHash
		  );
		});
		es.start();
	
		return {
		  stopListening: () => {
			es.unsubscribe(EventName.DeployProcessed);
			es.stop();
			this.isListening = false;
			this.pendingDeploys = [];
		  },
		};
	  }
	
	private addPendingDeploy(deployType: RouterEvents, deployHash: string) {
		this.pendingDeploys = [...this.pendingDeploys, { deployHash, deployType }];
	}

	public async registerWebHook(backendLink: String, endpointLink: String) {
		let axiosStatus;
		await axios({
			method: "post",
			url: "https://createpairapi.herokuapp.com/register",
			data: {
				backendLink: backendLink,
				endpointLink: endpointLink,
			},
		})
			.then(function (response: any) {
				console.log("Data : " + JSON.stringify(response.data));
				console.log("Status : " + response.status);
				console.log("Status Text : " + response.statusText);
				console.log("Header : " + response.headers);
				// console.log(response.config);
				axiosStatus = true;
			})
			.catch(function (error: any) {
				console.log(error);
				axiosStatus = false;
			});

		return axiosStatus;
	}

	public async CreatePairApi(
		factorycontracthash: String,
		flashswappercontractash: String
	) {
		let axiosStatus;
		await axios({
			method: "post",
			url: "https://createpairapi.herokuapp.com/deployPairContract",
			data: {
				factoryContractHash: factorycontracthash,
				flashswapperContractHash: flashswappercontractash,
			},
		})
			.then(function (response: any) {
				console.log("Data : " + JSON.stringify(response.data));
				console.log("Status : " + response.status);
				console.log("Status Text : " + response.statusText);
				console.log("Header : " + response.headers);
				// console.log(response.config);
				axiosStatus = true;
			})
			.catch(function (error: any) {
				console.log(error);
				axiosStatus = false;
			});

		return axiosStatus;
	}
}

interface IInstallParams {
	nodeAddress: string;
	keys: Keys.AsymmetricKey;
	chainName: string;
	pathToContract: string;
	runtimeArgs: RuntimeArgs;
	paymentAmount: string;
}

const installWasmFile = async ({
	nodeAddress,
	keys,
	chainName,
	pathToContract,
	runtimeArgs,
	paymentAmount,
}: IInstallParams): Promise<string> => {
	const client = new CasperClient(nodeAddress);

	// Set contract installation deploy (unsigned).
	let deploy = DeployUtil.makeDeploy(
		new DeployUtil.DeployParams(
			CLPublicKey.fromHex(keys.publicKey.toHex()),
			chainName
		),
		DeployUtil.ExecutableDeployItem.newModuleBytes(
			utils.getBinary(pathToContract),
			runtimeArgs
		),
		DeployUtil.standardPayment(paymentAmount)
	);

	// Sign deploy.
	deploy = client.signDeploy(deploy, keys);

	// Dispatch deploy to node.
	return await client.putDeploy(deploy);
};

interface IContractCallParams {
	nodeAddress: string;
	keys: Keys.AsymmetricKey;
	chainName: string;
	entryPoint: string;
	runtimeArgs: RuntimeArgs;
	paymentAmount: string;
	contractHash: string;
}

const contractCall = async ({
	nodeAddress,
	keys,
	chainName,
	contractHash,
	entryPoint,
	runtimeArgs,
	paymentAmount,
}: IContractCallParams) => {
	const client = new CasperClient(nodeAddress);
	const contractHashAsByteArray = utils.contractHashToByteArray(contractHash);

	let deploy = DeployUtil.makeDeploy(
		new DeployUtil.DeployParams(keys.publicKey, chainName),
		DeployUtil.ExecutableDeployItem.newStoredContractByHash(
			contractHashAsByteArray,
			entryPoint,
			runtimeArgs
		),
		DeployUtil.standardPayment(paymentAmount)
	);

	// Sign deploy.
	deploy = client.signDeploy(deploy, keys);

	// Dispatch deploy to node.
	const deployHash = await client.putDeploy(deploy);

	return deployHash;
};

interface IContractInterfaceCallParams {
	keys: string;
	chainName: string;
	entryPoint: string;
	runtimeArgs: RuntimeArgs;
	paymentAmount: string;
	contractHash: string;
}

const contractCallinterface = async ({
	keys,
	chainName,
	contractHash,
	entryPoint,
	runtimeArgs,
	paymentAmount,
}: IContractInterfaceCallParams) => {
	console.log("hello");
	const contractHashAsByteArray = utils.contractHashToByteArray(contractHash);
	console.log("hello2");
	console.log("contractHashAsByteArray",contractHashAsByteArray);
	console.log("key",keys);
	let deploy = DeployUtil.makeDeploy(
		new DeployUtil.DeployParams(CLPublicKey.fromHex(keys), chainName),
		DeployUtil.ExecutableDeployItem.newStoredContractByHash(
			contractHashAsByteArray,
			entryPoint,
			runtimeArgs
		),
		DeployUtil.standardPayment(paymentAmount)
	);
	console.log("hello3");
	console.log("deploy: ",deploy);

	let deployJSON = DeployUtil.deployToJson(deploy);
	console.log("deployJSON: ",deployJSON);

	return JSON.parse(JSON.stringify(deployJSON));
};

const contractSimpleGetter = async (
	nodeAddress: string,
	contractHash: string,
	key: string[]
) => {
	const stateRootHash = await utils.getStateRootHash(nodeAddress);
	const clValue = await utils.getContractData(
		nodeAddress,
		stateRootHash,
		contractHash,
		key
	);

	if (clValue && clValue.CLValue instanceof CLValue) {
		return clValue.CLValue!;
	} else {
		throw Error("Invalid stored value");
	}
};

const toCLMap = (map: Map<string, string>) => {
	const clMap = CLValueBuilder.map([
		CLTypeBuilder.string(),
		CLTypeBuilder.string(),
	]);
	for (const [key, value] of Array.from(map.entries())) {
		clMap.set(CLValueBuilder.string(key), CLValueBuilder.string(value));
	}
	return clMap;
};

const fromCLMap = (map: Map<CLString, CLString>) => {
	const jsMap = new Map();
	for (const [key, value] of Array.from(map.entries())) {
		jsMap.set(key.value(), value.value());
	}
	return jsMap;
};

export default UniswapRouterClient;
