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

const WCSPR_ADDRESS = "d540e0435C6Be6E7f359e132a99566d8da9d4aDc6bF19254072F32cc62A922bB".toLowerCase();
const WCSPR_USDC__PAIR = "27982d94c019D7E51c43C5aA60b771f458DcEddC7CEFFcc6d120f62B7321a610".toLowerCase(); // created 10008355
const WCSPR_DAI_PAIR = "0000000000000000000000000000000000000000000000000000000000000000".toLowerCase(); // created block 10042267
const WCSPR_USDT_PAIR = "0000000000000000000000000000000000000000000000000000000000000000".toLowerCase(); // created block 10093341

async function getEthPriceInUSD() {

  // fetch eth prices for each stablecoin
  let daiPair = await Pair.findOne({ id: WCSPR_DAI_PAIR }); // dai is token0
  let usdcPair = await Pair.findOne({ id: WCSPR_USDC__PAIR }); // usdc is token0
  let usdtPair = await Pair.findOne({ id: WCSPR_USDT_PAIR }); // usdt is token1

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
  "d540e0435C6Be6E7f359e132a99566d8da9d4aDc6bF19254072F32cc62A922bB".toLowerCase(), // WCSPR
  "0000000000000000000000000000000000000000000000000000000000000000".toLowerCase(), // DAI
  "45825eA26146D81EC58b7566B25757cD03B4e4F447Af1573E22EBeF38D93a6c1".toLowerCase(), // USDC
  "0000000000000000000000000000000000000000000000000000000000000000".toLowerCase(), // USDT
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
  if (token.id == WCSPR_ADDRESS) {
    return ONE_BD;
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    //let pairAddress = await factory.getPair(process.env.FACTORY_CONTRACT,token.id, WHITELIST[i]);
    let pairAddress="0000000000000000000000000000000000000000000000000000000000000000";
    
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
  // if (UNTRACKED_PAIRS.includes(pair.id)) {
  //   return ZERO_BD;
  // }

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
