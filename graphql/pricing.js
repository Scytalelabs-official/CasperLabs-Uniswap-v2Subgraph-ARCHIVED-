const Pair = require("../models/pair");
const Token = require("../models/token");
const Bundle = require("../models/bundle");
var factory = require('../JsClients/FACTORY/test/installed.ts');
require("dotenv").config();

const {
  ZERO_BD,
  ADDRESS_ZERO,
  ONE_BD,
  //UNTRACKED_PAIRS
} = require("./helpers");

const WETH_ADDRESS = "hash-0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDC_WETH_PAIR = "hash-0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"; // created 10008355
const DAI_WETH_PAIR = "hash-0xa478c2975ab1ea89e8196811f51a7b7ade33eb11"; // created block 10042267
const USDT_WETH_PAIR = "hash-0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"; // created block 10093341

async function getEthPriceInUSD() {
  // fetch eth prices for each stablecoin
  let daiPair = await Pair.findOne({ id: DAI_WETH_PAIR }); // dai is token0
  let usdcPair = await Pair.findOne({ id: USDC_WETH_PAIR }); // usdc is token0
  let usdtPair = await Pair.findOne({ id: USDT_WETH_PAIR }); // usdt is token1

  // all 3 have been created
  if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
    let totalLiquidityETH =
      daiPair.reserve1 + usdcPair.reserve1 + usdtPair.reserve0;
    let daiWeight = daiPair.reserve1 / totalLiquidityETH;
    let usdcWeight = usdcPair.reserve1 / totalLiquidityETH;
    let usdtWeight = usdtPair.reserve0 / totalLiquidityETH;
    return (
      daiPair.token0Price * daiWeight +
      usdcPair.token0Price * usdcWeight +
      usdtPair.token1Price * usdtWeight
    );
    // dai and USDC have been created
  } else if (daiPair !== null && usdcPair !== null) {
    let totalLiquidityETH = daiPair.reserve1 + usdcPair.reserve1;
    let daiWeight = daiPair.reserve1 / totalLiquidityETH;
    let usdcWeight = usdcPair.reserve1 / totalLiquidityETH;
    return daiPair.token0Price * daiWeight + usdcPair.token0Price * usdcWeight;
    // USDC is the only pair so far
  } else if (usdcPair !== null) {
    return usdcPair.token0Price;
  } else {
    return ZERO_BD;
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST = [
  "hash-0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
  "hash-0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
  "hash-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "hash-0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
  "hash-0x0000000000085d4780b73119b644ae5ecd22b376", // TUSD
  "hash-0x5d3a536e4d6dbd6114cc1ead35777bab948e3643", // cDAI
  "hash-0x39aa39c021dfbae8fac545936693ac917d5e7563", // cUSDC
  "hash-0x86fadb80d8d2cff3c3680819e4da99c10232ba0f", // EBASE
  "hash-0x57ab1ec28d129707052df4df418d58a2d46d5f51", // sUSD
  "hash-0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", // MKR
  "hash-0xc00e94cb662c3520282e6f5717214004a7f26888", // COMP
  "hash-0x514910771af9ca656af840dff83e8264ecf986ca", //LINK
  "hash-0x960b236a07cf122663c4303350609a66a7b288c0", //ANT
  "hash-0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", //SNX
  "hash-0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e", //YFI
  "hash-0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8", // yCurv
  "hash-0x853d955acef822db058eb8505911ed77f175b99e", // FRAX
  "hash-0xa47c8bf37f92abed4a126bda807a7b7498661acd", // WUST
  "hash-0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", // UNI
  "hash-0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
];

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
//let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('400000');
let MINIMUM_USD_THRESHOLD_NEW_PAIRS = 400000;

// minimum liquidity for price to get tracked
//let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('2');
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = 2;

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
async function findEthPerToken(token) {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD;
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    //let pairAddress = await factory.getPair(process.env.FACTORY_ADDRESS,token.id, WHITELIST[i]);
    
    let pairAddress =
      "hash-0000000000000000000000000000000000000000000000000000000000000000";
    if (pairAddress != ADDRESS_ZERO) {
      let pair = await Pair.findOne({ id: pairAddress });
      if (
        pair.token0 == token.id &&
        pair.reserveETH > MINIMUM_LIQUIDITY_THRESHOLD_ETH
      ) {
        let token1 = await Token.findOne({ id: pair.token1 });
        return pair.token1Price * token1.derivedETH; // return token1 per our token * Eth per token 1
      }
      if (
        pair.token1 == token.id &&
        pair.reserveETH > MINIMUM_LIQUIDITY_THRESHOLD_ETH
      ) {
        let token0 = await Token.findOne({ id: pair.token0 });
        return pair.token0Price * token0.derivedETH; // return token0 per our token * ETH per token 0
      }
    }
  }
  return ZERO_BD; // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
async function getTrackedVolumeUSD(
  tokenAmount0,
  token0,
  tokenAmount1,
  token1,
  pair
) {
  let bundle = await Bundle.findOne({ id: "1" });
  let price0 = token0.derivedETH * bundle.ethPrice;
  let price1 = token1.derivedETH * bundle.ethPrice;

  // dont count tracked volume on these pairs - usually rebass tokens
  if (UNTRACKED_PAIRS.includes(pair.id)) {
    return ZERO_BD;
  }

  // if less than 5 LPs, require high minimum reserve amount amount or return 0
  if (pair.liquidityProviderCount < 5) {
    let reserve0USD = pair.reserve0 * price0;
    let reserve1USD = pair.reserve1 * price1;
    if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve0USD + reserve1USD < MINIMUM_USD_THRESHOLD_NEW_PAIRS) {
        return ZERO_BD;
      }
    }
    if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
      if (reserve0USD * 2 < MINIMUM_USD_THRESHOLD_NEW_PAIRS) {
        return ZERO_BD;
      }
    }
    if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve1USD * 2 < MINIMUM_USD_THRESHOLD_NEW_PAIRS) {
        return ZERO_BD;
      }
    }
  }

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0 * price0 + (tokenAmount1 * price1) / 2;
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0 * price0;
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1 * price1;
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD;
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
async function getTrackedLiquidityUSD(
  tokenAmount0,
  token0,
  tokenAmount1,
  token1
) {
  let bundle = await Bundle.findOne({ id: "1" });
  let price0 = token0.derivedETH * bundle.ethPrice;
  let price1 = token1.derivedETH * bundle.ethPrice;

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0 * price0 + tokenAmount1 * price1;
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0 * price0 * 2;
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1 * price1 * 2;
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD;
}

module.exports = {
  getEthPriceInUSD,
  findEthPerToken,
  getTrackedVolumeUSD,
  getTrackedLiquidityUSD,
};
