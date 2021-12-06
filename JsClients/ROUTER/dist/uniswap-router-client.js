"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var casper_js_sdk_1 = require("casper-js-sdk");
var constants_1 = require("./constants");
var utils = __importStar(require("./utils"));
var UniswapRouterClient = /** @class */ (function () {
    function UniswapRouterClient(nodeAddress, chainName, eventStreamAddress) {
        this.nodeAddress = nodeAddress;
        this.chainName = chainName;
        this.eventStreamAddress = eventStreamAddress;
        this.contractName = "uniswap_router";
        this.isListening = false;
        this.pendingDeploys = [];
    }
    UniswapRouterClient.prototype.install = function (keys, // Have Public/Private Key Pair
    tokenName, factory, libraryHash, paymentAmount, wasmPath) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.contractHash;
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            token_name: casper_js_sdk_1.CLValueBuilder.string(tokenName),
                            _factory: casper_js_sdk_1.CLValueBuilder.string(factory),
                            library_hash: casper_js_sdk_1.CLValueBuilder.string(libraryHash),
                        });
                        return [4 /*yield*/, installWasmFile({
                                chainName: this.chainName,
                                paymentAmount: paymentAmount,
                                nodeAddress: this.nodeAddress,
                                keys: keys,
                                pathToContract: wasmPath,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Problem with installation");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.setContractHash = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var stateRootHash, contractData, _a, contractPackageHash, namedKeys, LIST_OF_NAMED_KEYS;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, utils.getStateRootHash(this.nodeAddress)];
                    case 1:
                        stateRootHash = _b.sent();
                        return [4 /*yield*/, utils.getContractData(this.nodeAddress, stateRootHash, hash)];
                    case 2:
                        contractData = _b.sent();
                        _a = contractData.Contract, contractPackageHash = _a.contractPackageHash, namedKeys = _a.namedKeys;
                        this.contractHash = hash;
                        this.contractPackageHash = contractPackageHash.replace("contract-package-wasm", "");
                        LIST_OF_NAMED_KEYS = [
                            this.contractName + "_package_hash",
                            this.contractName + "_package_hash_wrapped",
                            this.contractName + "_contract_hash",
                            this.contractName + "_contract_hash_wrapped",
                            this.contractName + "_package_access_token",
                        ];
                        // @ts-ignore
                        this.namedKeys = namedKeys.reduce(function (acc, val) {
                            var _a;
                            if (LIST_OF_NAMED_KEYS.includes(val.name)) {
                                return __assign(__assign({}, acc), (_a = {}, _a[utils.camelCased(val.name)] = val.key, _a));
                            }
                            return acc;
                        }, {});
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.add_liquidity = function (keys, token_a, token_b, amount_a_desired, // using string instead of 'number' because number is 64 bit in TS, we need 256 bits
    amount_b_desired, amount_a_min, amount_b_min, to, deadline, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            token_a: utils.createRecipientAddress(token_a),
                            token_b: utils.createRecipientAddress(token_b),
                            amount_a_desired: casper_js_sdk_1.CLValueBuilder.u256(amount_a_desired),
                            amount_b_desired: casper_js_sdk_1.CLValueBuilder.u256(amount_b_desired),
                            amount_a_min: casper_js_sdk_1.CLValueBuilder.u256(amount_a_min),
                            amount_b_min: casper_js_sdk_1.CLValueBuilder.u256(amount_b_min),
                            to: utils.createRecipientAddress(to),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline)
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "add_liquidity",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.AddLiquidity, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.add_liquidity_cspr = function (keys, token, amount_token_desired, amount_cspr_desired, amount_token_min, amount_cspr_min, to, deadline, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            token: utils.createRecipientAddress(token),
                            amount_token_desired: casper_js_sdk_1.CLValueBuilder.u256(amount_token_desired),
                            amount_cspr_desired: casper_js_sdk_1.CLValueBuilder.u256(amount_cspr_desired),
                            amount_token_min: casper_js_sdk_1.CLValueBuilder.u256(amount_token_min),
                            amount_cspr_min: casper_js_sdk_1.CLValueBuilder.u256(amount_cspr_min),
                            to: utils.createRecipientAddress(to),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline)
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "add_liquidity_cspr",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.AddLiquidityCSPR, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.remove_liquidity = function (keys, token_a, token_b, liquidity, amount_a_min, amount_b_min, to, deadline, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            token_a: utils.createRecipientAddress(token_a),
                            token_b: utils.createRecipientAddress(token_b),
                            liquidity: casper_js_sdk_1.CLValueBuilder.u256(liquidity),
                            amount_a_min: casper_js_sdk_1.CLValueBuilder.u256(amount_a_min),
                            amount_b_min: casper_js_sdk_1.CLValueBuilder.u256(amount_b_min),
                            to: utils.createRecipientAddress(to),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline)
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "remove_liquidity",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.RemoveLiquidity, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.remove_liquidity_cspr = function (keys, token, liquidity, amount_token_min, amount_cspr_min, to, deadline, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            token: utils.createRecipientAddress(token),
                            liquidity: casper_js_sdk_1.CLValueBuilder.u256(liquidity),
                            amount_token_min: casper_js_sdk_1.CLValueBuilder.u256(amount_token_min),
                            amount_cspr_min: casper_js_sdk_1.CLValueBuilder.u256(amount_cspr_min),
                            to: utils.createRecipientAddress(to),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline)
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "remove_liquidity_cspr",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.RemoveLiquidityCSPR, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Buffer.from(string) but it converts the string
    // We want the actual bytes value from something..
    UniswapRouterClient.prototype.remove_liquidity_with_permit = function (keys, token_a, token_b, liquidity, amount_a_min, amount_b_min, to, deadline, approve_max, v, r, s, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var r_bytes, s_bytes, runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        r_bytes = r.map(casper_js_sdk_1.CLValueBuilder.u8);
                        s_bytes = s.map(casper_js_sdk_1.CLValueBuilder.u8);
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            token_a: utils.createRecipientAddress(token_a),
                            token_b: utils.createRecipientAddress(token_b),
                            liquidity: casper_js_sdk_1.CLValueBuilder.u256(liquidity),
                            amount_a_min: casper_js_sdk_1.CLValueBuilder.u256(amount_a_min),
                            amount_b_min: casper_js_sdk_1.CLValueBuilder.u256(amount_b_min),
                            to: utils.createRecipientAddress(to),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline),
                            approve_max: casper_js_sdk_1.CLValueBuilder.bool(approve_max),
                            v: casper_js_sdk_1.CLValueBuilder.u8(v),
                            r: casper_js_sdk_1.CLValueBuilder.list(r_bytes),
                            s: casper_js_sdk_1.CLValueBuilder.list(s_bytes)
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "remove_liquidity_with_permit",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.RemoveLiquidityWithPermit, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.remove_liquidity_cspr_with_permit = function (keys, token, liquidity, amount_token_min, amount_cspr_min, to, deadline, approve_max, v, r, s, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var r_bytes, s_bytes, runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        r_bytes = r.map(casper_js_sdk_1.CLValueBuilder.u8);
                        s_bytes = s.map(casper_js_sdk_1.CLValueBuilder.u8);
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            token: utils.createRecipientAddress(token),
                            liquidity: casper_js_sdk_1.CLValueBuilder.u256(liquidity),
                            amount_token_min: casper_js_sdk_1.CLValueBuilder.u256(amount_token_min),
                            amount_cspr_min: casper_js_sdk_1.CLValueBuilder.u256(amount_cspr_min),
                            to: utils.createRecipientAddress(to),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline),
                            approve_max: casper_js_sdk_1.CLValueBuilder.bool(approve_max),
                            v: casper_js_sdk_1.CLValueBuilder.u8(v),
                            r: casper_js_sdk_1.CLValueBuilder.list(r_bytes),
                            s: casper_js_sdk_1.CLValueBuilder.list(s_bytes)
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "remove_liquidity_cspr_with_permit",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.RemoveLiquidityCSPRWithPermit, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.swap_exact_tokens_for_tokens = function (keys, amount_in, amount_out_min, path, to, deadline, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var _paths, i, runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _paths = [];
                        for (i = 0; i < path.length; i++) {
                            _paths.push(utils.createRecipientAddress(path[i]));
                        }
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            amount_in: casper_js_sdk_1.CLValueBuilder.u256(amount_in),
                            amount_out_min: casper_js_sdk_1.CLValueBuilder.u256(amount_out_min),
                            path: casper_js_sdk_1.CLValueBuilder.list(_paths),
                            to: utils.createRecipientAddress(to),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline)
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "swap_exact_tokens_for_tokens",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.SwapExactTokensForTokens, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.swap_tokens_for_exact_tokens = function (keys, amount_out, amount_in_max, path, to, deadline, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var _paths, i, runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _paths = [];
                        for (i = 0; i < path.length; i++) {
                            _paths.push(utils.createRecipientAddress(path[i]));
                        }
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            amount_out: casper_js_sdk_1.CLValueBuilder.u256(amount_out),
                            amount_in_max: casper_js_sdk_1.CLValueBuilder.u256(amount_in_max),
                            path: casper_js_sdk_1.CLValueBuilder.list(_paths),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline),
                            to: utils.createRecipientAddress(to)
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "swap_tokens_for_exact_tokens",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.SwapTokensForExactTokens, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.swap_exact_cspr_for_tokens = function (keys, amount_out_min, amount_in, path, to, deadline, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var _path, i, runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _path = [];
                        for (i = 0; i < path.length; i++) {
                            _path.push(utils.createRecipientAddress(path[i]));
                        }
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            amount_out_min: casper_js_sdk_1.CLValueBuilder.u256(amount_out_min),
                            amount_in: casper_js_sdk_1.CLValueBuilder.u256(amount_in),
                            path: casper_js_sdk_1.CLValueBuilder.list(_path),
                            to: utils.createRecipientAddress(to),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline),
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "swap_exact_cspr_for_tokens",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.SwapExactCSPRForTokens, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.swap_tokens_for_exact_cspr = function (keys, amount_out, amount_in_max, path, to, deadline, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var _paths, i, runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _paths = [];
                        for (i = 0; i < path.length; i++) {
                            _paths.push(utils.createRecipientAddress(path[i]));
                        }
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            amount_out: casper_js_sdk_1.CLValueBuilder.u256(amount_out),
                            amount_in_max: casper_js_sdk_1.CLValueBuilder.u256(amount_in_max),
                            path: casper_js_sdk_1.CLValueBuilder.list(_paths),
                            to: utils.createRecipientAddress(to),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline)
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "swap_tokens_for_exact_cspr",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.SwapTokensForExactCSPR, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.swap_exact_tokens_for_cspr = function (keys, amount_in, amount_out_min, path, to, deadline, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var _paths, i, runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _paths = [];
                        for (i = 0; i < path.length; i++) {
                            _paths.push(utils.createRecipientAddress(path[i]));
                        }
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            amount_in: casper_js_sdk_1.CLValueBuilder.u256(amount_in),
                            amount_out_min: casper_js_sdk_1.CLValueBuilder.u256(amount_out_min),
                            path: casper_js_sdk_1.CLValueBuilder.list(_paths),
                            to: utils.createRecipientAddress(to),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline)
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "swap_exact_tokens_for_cspr",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.SwapExactTokensForCSPR, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UniswapRouterClient.prototype.swap_cspr_for_exact_tokens = function (keys, amount_out, amount_in_max, path, to, deadline, paymentAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var _paths, i, runtimeArgs, deployHash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _paths = [];
                        for (i = 0; i < path.length; i++) {
                            _paths.push(utils.createRecipientAddress(path[i]));
                        }
                        runtimeArgs = casper_js_sdk_1.RuntimeArgs.fromMap({
                            amount_out: casper_js_sdk_1.CLValueBuilder.u256(amount_out),
                            amount_in_max: casper_js_sdk_1.CLValueBuilder.u256(amount_in_max),
                            path: casper_js_sdk_1.CLValueBuilder.list(_paths),
                            to: utils.createRecipientAddress(to),
                            deadline: casper_js_sdk_1.CLValueBuilder.u256(deadline)
                        });
                        return [4 /*yield*/, contractCall({
                                chainName: this.chainName,
                                contractHash: this.contractHash,
                                entryPoint: "swap_cspr_for_exact_tokens",
                                keys: keys,
                                nodeAddress: this.nodeAddress,
                                paymentAmount: paymentAmount,
                                runtimeArgs: runtimeArgs,
                            })];
                    case 1:
                        deployHash = _a.sent();
                        if (deployHash !== null) {
                            this.addPendingDeploy(constants_1.RouterEvents.SwapCSPRForExactTokens, deployHash);
                            return [2 /*return*/, deployHash];
                        }
                        else {
                            throw Error("Invalid Deploy");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
    public async quote(
      keys: Keys.AsymmetricKey,
      amount_a: string,
      reserve_a: string,
      reserve_b: string,
      paymentAmount: string
      ) {
  
        const runtimeArgs = RuntimeArgs.fromMap({
          amount_a: CLValueBuilder.u256(amount_a),
          reserve_a: CLValueBuilder.u256(reserve_a),
          reserve_b: CLValueBuilder.u256(reserve_b),
        });
  
        const deployHash = await contractCall({
          chainName: this.chainName,
          contractHash: this.contractHash,
          entryPoint: "quote",
          keys,
          nodeAddress: this.nodeAddress,
          paymentAmount,
          runtimeArgs,
        });
  
        if (deployHash !== null) {
          this.addPendingDeploy(RouterEvents.Quote, deployHash);
          return deployHash;
        } else {
          throw Error("Invalid Deploy");
        }
  
    }
  
    public async get_amount_out(
      keys: Keys.AsymmetricKey,
      amount_in: string,
      reserve_in: string,
      reserve_out: string,
      paymentAmount: string
      ) {
  
        const runtimeArgs = RuntimeArgs.fromMap({
          amount_in: CLValueBuilder.u256(amount_in),
          reserve_in: CLValueBuilder.u256(reserve_in),
          reserve_out: CLValueBuilder.u256(reserve_out),
        });
  
        const deployHash = await contractCall({
          chainName: this.chainName,
          contractHash: this.contractHash,
          entryPoint: "get_amount_out",
          keys,
          nodeAddress: this.nodeAddress,
          paymentAmount,
          runtimeArgs,
        });
  
        if (deployHash !== null) {
          this.addPendingDeploy(RouterEvents.GetAmountOut, deployHash);
          return deployHash;
        } else {
          throw Error("Invalid Deploy");
        }
  
    }
  
    public async get_amount_in(
      keys: Keys.AsymmetricKey,
      amount_out: string,
      reserve_in: string,
      reserve_out: string,
      paymentAmount: string
      ) {
  
        const runtimeArgs = RuntimeArgs.fromMap({
          amount_out: CLValueBuilder.u256(amount_out),
          reserve_in: CLValueBuilder.u256(reserve_in),
          reserve_out: CLValueBuilder.u256(reserve_out),
        });
  
        const deployHash = await contractCall({
          chainName: this.chainName,
          contractHash: this.contractHash,
          entryPoint: "get_amount_in",
          keys,
          nodeAddress: this.nodeAddress,
          paymentAmount,
          runtimeArgs,
        });
  
        if (deployHash !== null) {
          this.addPendingDeploy(RouterEvents.GetAmountIn, deployHash);
          return deployHash;
        } else {
          throw Error("Invalid Deploy");
        }
  
    }
  
    public async get_amounts_out(
      keys: Keys.AsymmetricKey,
      amount_in: string,
      path: RecipientType[],
      paymentAmount: string
      ) {
  
        // MAPPED THIS ACCORDING TO UTIL createRecipientAddress function
        let _paths:CLKey[] = [];
        for(let i = 0; i < path.length; i++){
          _paths.push(utils.createRecipientAddress(path[i]));
        }
  
        const runtimeArgs = RuntimeArgs.fromMap({
          amount_in: CLValueBuilder.u256(amount_in),
          path: CLValueBuilder.list(_paths)
        });
  
        const deployHash = await contractCall({
          chainName: this.chainName,
          contractHash: this.contractHash,
          entryPoint: "get_amounts_out",
          keys,
          nodeAddress: this.nodeAddress,
          paymentAmount,
          runtimeArgs,
        });
  
        if (deployHash !== null) {
          this.addPendingDeploy(RouterEvents.GetAmountsOut, deployHash);
          return deployHash;
        } else {
          throw Error("Invalid Deploy");
        }
  
    }
  
    public async get_amounts_in(
      keys: Keys.AsymmetricKey,
      amount_out: string,
      path: RecipientType[],
      paymentAmount: string
      ) {
  
        // MAPPED THIS ACCORDING TO UTIL createRecipientAddress function
        let _paths:CLKey[] = [];
        for(let i = 0; i < path.length; i++){
          _paths.push(utils.createRecipientAddress(path[i]));
        }
  
        const runtimeArgs = RuntimeArgs.fromMap({
          amount_out: CLValueBuilder.u256(amount_out),
          path: CLValueBuilder.list(_paths)
        });
  
        const deployHash = await contractCall({
          chainName: this.chainName,
          contractHash: this.contractHash,
          entryPoint: "get_amounts_in",
          keys,
          nodeAddress: this.nodeAddress,
          paymentAmount,
          runtimeArgs,
        });
  
        if (deployHash !== null) {
          this.addPendingDeploy(RouterEvents.GetAmountsIn, deployHash);
          return deployHash;
        } else {
          throw Error("Invalid Deploy");
        }
  
    }
    */
    UniswapRouterClient.prototype.onEvent = function (eventNames, callback) {
        var _this = this;
        if (!this.eventStreamAddress) {
            throw Error("Please set eventStreamAddress before!");
        }
        if (this.isListening) {
            throw Error("Only one event listener can be create at a time. Remove the previous one and start new.");
        }
        var es = new casper_js_sdk_1.EventStream(this.eventStreamAddress);
        this.isListening = true;
        es.subscribe(casper_js_sdk_1.EventName.DeployProcessed, function (value) {
            var deployHash = value.body.DeployProcessed.deploy_hash;
            var pendingDeploy = _this.pendingDeploys.find(function (pending) { return pending.deployHash === deployHash; });
            if (!pendingDeploy) {
                return;
            }
            if (!value.body.DeployProcessed.execution_result.Success &&
                value.body.DeployProcessed.execution_result.Failure) {
                callback(pendingDeploy.deployType, {
                    deployHash: deployHash,
                    error: value.body.DeployProcessed.execution_result.Failure.error_message,
                    success: false,
                }, null);
            }
            else {
                var transforms = value.body.DeployProcessed.execution_result.Success.effect.transforms;
                var cep47Events = transforms.reduce(function (acc, val) {
                    if (val.transform.hasOwnProperty("WriteCLValue") &&
                        typeof val.transform.WriteCLValue.parsed === "object" &&
                        val.transform.WriteCLValue.parsed !== null) {
                        var maybeCLValue = casper_js_sdk_1.CLValueParsers.fromJSON(val.transform.WriteCLValue);
                        var clValue = maybeCLValue.unwrap();
                        if (clValue && clValue instanceof casper_js_sdk_1.CLMap) {
                            var hash = clValue.get(casper_js_sdk_1.CLValueBuilder.string("contract_package_hash"));
                            var event_1 = clValue.get(casper_js_sdk_1.CLValueBuilder.string("event_type"));
                            if (hash &&
                                hash.value() === _this.contractPackageHash &&
                                event_1 &&
                                eventNames.includes(event_1.value())) {
                                acc = __spreadArray(__spreadArray([], acc, true), [{ name: event_1.value(), clValue: clValue }], false);
                            }
                        }
                    }
                    return acc;
                }, []);
                cep47Events.forEach(function (d) {
                    return callback(d.name, { deployHash: deployHash, error: null, success: true }, d.clValue);
                });
            }
            _this.pendingDeploys = _this.pendingDeploys.filter(function (pending) { return pending.deployHash !== deployHash; });
        });
        es.start();
        return {
            stopListening: function () {
                es.unsubscribe(casper_js_sdk_1.EventName.DeployProcessed);
                es.stop();
                _this.isListening = false;
                _this.pendingDeploys = [];
            },
        };
    };
    UniswapRouterClient.prototype.addPendingDeploy = function (deployType, deployHash) {
        this.pendingDeploys = __spreadArray(__spreadArray([], this.pendingDeploys, true), [{ deployHash: deployHash, deployType: deployType }], false);
    };
    return UniswapRouterClient;
}());
var installWasmFile = function (_a) {
    var nodeAddress = _a.nodeAddress, keys = _a.keys, chainName = _a.chainName, pathToContract = _a.pathToContract, runtimeArgs = _a.runtimeArgs, paymentAmount = _a.paymentAmount;
    return __awaiter(void 0, void 0, void 0, function () {
        var client, deploy;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    client = new casper_js_sdk_1.CasperClient(nodeAddress);
                    deploy = casper_js_sdk_1.DeployUtil.makeDeploy(new casper_js_sdk_1.DeployUtil.DeployParams(casper_js_sdk_1.CLPublicKey.fromHex(keys.publicKey.toHex()), chainName), casper_js_sdk_1.DeployUtil.ExecutableDeployItem.newModuleBytes(utils.getBinary(pathToContract), runtimeArgs), casper_js_sdk_1.DeployUtil.standardPayment(paymentAmount));
                    // Sign deploy.
                    deploy = client.signDeploy(deploy, keys);
                    return [4 /*yield*/, client.putDeploy(deploy)];
                case 1: 
                // Dispatch deploy to node.
                return [2 /*return*/, _b.sent()];
            }
        });
    });
};
var contractCall = function (_a) {
    var nodeAddress = _a.nodeAddress, keys = _a.keys, chainName = _a.chainName, contractHash = _a.contractHash, entryPoint = _a.entryPoint, runtimeArgs = _a.runtimeArgs, paymentAmount = _a.paymentAmount;
    return __awaiter(void 0, void 0, void 0, function () {
        var client, contractHashAsByteArray, deploy, deployHash;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    client = new casper_js_sdk_1.CasperClient(nodeAddress);
                    contractHashAsByteArray = utils.contractHashToByteArray(contractHash);
                    deploy = casper_js_sdk_1.DeployUtil.makeDeploy(new casper_js_sdk_1.DeployUtil.DeployParams(keys.publicKey, chainName), casper_js_sdk_1.DeployUtil.ExecutableDeployItem.newStoredContractByHash(contractHashAsByteArray, entryPoint, runtimeArgs), casper_js_sdk_1.DeployUtil.standardPayment(paymentAmount));
                    // Sign deploy.
                    deploy = client.signDeploy(deploy, keys);
                    return [4 /*yield*/, client.putDeploy(deploy)];
                case 1:
                    deployHash = _b.sent();
                    return [2 /*return*/, deployHash];
            }
        });
    });
};
var contractSimpleGetter = function (nodeAddress, contractHash, key) { return __awaiter(void 0, void 0, void 0, function () {
    var stateRootHash, clValue;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, utils.getStateRootHash(nodeAddress)];
            case 1:
                stateRootHash = _a.sent();
                return [4 /*yield*/, utils.getContractData(nodeAddress, stateRootHash, contractHash, key)];
            case 2:
                clValue = _a.sent();
                if (clValue && clValue.CLValue instanceof casper_js_sdk_1.CLValue) {
                    return [2 /*return*/, clValue.CLValue];
                }
                else {
                    throw Error("Invalid stored value");
                }
                return [2 /*return*/];
        }
    });
}); };
var toCLMap = function (map) {
    var clMap = casper_js_sdk_1.CLValueBuilder.map([
        casper_js_sdk_1.CLTypeBuilder.string(),
        casper_js_sdk_1.CLTypeBuilder.string(),
    ]);
    for (var _i = 0, _a = Array.from(map.entries()); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        clMap.set(casper_js_sdk_1.CLValueBuilder.string(key), casper_js_sdk_1.CLValueBuilder.string(value));
    }
    return clMap;
};
var fromCLMap = function (map) {
    var jsMap = new Map();
    for (var _i = 0, _a = Array.from(map.entries()); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        jsMap.set(key.value(), value.value());
    }
    return jsMap;
};
exports.default = UniswapRouterClient;
//# sourceMappingURL=uniswap-router-client.js.map