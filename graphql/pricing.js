const Pair = require("../models/pair");
const Token = require("../models/token");
const Bundle = require("../models/bundle");
var factory = require("../JsClients/FACTORY/factoryFunctionsForBackend/functions");
require("dotenv").config();

const {
  ZERO_BD,
  ADDRESS_ZERO,
  ONE_BD,
  //UNTRACKED_PAIRS
} = require("./helpers");

const WCSPR_ADDRESS =
  "b761da7d5ef67f8825c30c40df8b72feca4724eb666dba556b0e3f67778143e0".toLowerCase();
const WCSPR_USDC__PAIR =
  "cabce28fc7f7bb496c47ea56ae6ce62b17c7b9149afc3b3b32d863e5885070f6".toLowerCase(); // created 10008355
const WCSPR_DAI_PAIR =
  "53a8121f219ad2c6420f007a2016ed320c519579112b81d505cb15715404b264".toLowerCase(); // created block 10042267
const WCSPR_USDT_PAIR =
  "0000000000000000000000000000000000000000000000000000000000000000".toLowerCase(); // created block 10093341

async function getEthPriceInUSD() {
  // fetch eth prices for each stablecoin
  let daiPair = await Pair.findOne({ id: WCSPR_DAI_PAIR }); // dai is token0
  let usdcPair = await Pair.findOne({ id: WCSPR_USDC__PAIR }); // usdc is token0
  let usdtPair = await Pair.findOne({ id: WCSPR_USDT_PAIR }); // usdt is token1

  // all 3 have been created
  if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
    let totalLiquidityETH =
      BigInt(daiPair.reserve1) +
      BigInt(usdcPair.reserve1) +
      BigInt(usdtPair.reserve0);
    let daiWeight = BigInt(daiPair.reserve1) / totalLiquidityETH;
    let usdcWeight = BigInt(usdcPair.reserve1) / totalLiquidityETH;
    let usdtWeight = BigInt(usdtPair.reserve0) / totalLiquidityETH;
    return (
      (BigInt(daiPair.token0Price) * daiWeight) +
      (BigInt(usdcPair.token0Price) * usdcWeight) +
      (BigInt(usdtPair.token1Price) * usdtWeight)
    ).toString();
    // dai and USDC have been created
  } else if (daiPair !== null && usdcPair !== null) {
    let totalLiquidityETH =
      BigInt(daiPair.reserve1) + BigInt(usdcPair.reserve1);
    let daiWeight = BigInt(daiPair.reserve1) / totalLiquidityETH;
    let usdcWeight = BigInt(usdcPair.reserve1) / totalLiquidityETH;
    return (
      (BigInt(daiPair.token0Price) * daiWeight) +
      (BigInt(usdcPair.token0Price) * usdcWeight)
    ).toString();
    // USDC is the only pair so far
  } else if (usdcPair !== null) {
    return usdcPair.token0Price;
  } else {
    return ZERO_BD;
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST = [
  "b761da7d5ef67f8825c30c40df8b72feca4724eb666dba556b0e3f67778143e0".toLowerCase(), // WCSPR
  "1853ea67e80caaf81a8d96ff28ce3aaf105080f0299d9b7b7c0cb36064ee1fa9".toLowerCase(), // WISE
  "6ab4a5bf100fb9f444a12e92c663e3cf65a8c3ef4523cb2f80bed4fd41f85706".toLowerCase(), // USDC
];

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
//let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('400000');
let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigInt(400000);

// minimum liquidity for price to get tracked
//let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('2');
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigInt(2);

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
    let pairAddress =
      "0000000000000000000000000000000000000000000000000000000000000000";

    if (pairAddress != ADDRESS_ZERO) {
      let pair = await Pair.findOne({ id: pairAddress });
      if (
        pair.token0 == token.id &&
        BigInt(pair.reserveETH) > MINIMUM_LIQUIDITY_THRESHOLD_ETH
      ) {
        let token1 = await Token.findOne({ id: pair.token1 });
        return (
          BigInt(pair.token1Price) * BigInt(token1.derivedETH)
        ).toString(); // return token1 per our token * Eth per token 1
      }
      if (
        pair.token1 == token.id &&
        BigInt(pair.reserveETH) > MINIMUM_LIQUIDITY_THRESHOLD_ETH
      ) {
        let token0 = await Token.findOne({ id: pair.token0 });
        return (
          BigInt(pair.token0Price) * BigInt(token0.derivedETH)
        ).toString(); // return token0 per our token * ETH per token 0
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
  let price0 = BigInt(token0.derivedETH) * BigInt(bundle.ethPrice);
  let price1 = BigInt(token1.derivedETH) * BigInt(bundle.ethPrice);

  // dont count tracked volume on these pairs - usually rebass tokens
  // if (UNTRACKED_PAIRS.includes(pair.id)) {
  //   return ZERO_BD;
  // }

  // if less than 5 LPs, require high minimum reserve amount amount or return 0
  if (BigInt(pair.liquidityProviderCount) < BigInt(5)) {
    let reserve0USD = BigInt(pair.reserve0) * price0;
    let reserve1USD = BigInt(pair.reserve1) * price1;
    if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve0USD + reserve1USD < MINIMUM_USD_THRESHOLD_NEW_PAIRS) {
        return BigInt(ZERO_BD);
      }
    }
    if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
      if (reserve0USD * BigInt(2) < MINIMUM_USD_THRESHOLD_NEW_PAIRS) {
        return BigInt(ZERO_BD);
      }
    }
    if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve1USD * BigInt(2) < MINIMUM_USD_THRESHOLD_NEW_PAIRS) {
        return BigInt(ZERO_BD);
      }
    }
  }

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return ((tokenAmount0 * price0) + (tokenAmount1 * price1)) / BigInt(2);
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
  return BigInt(ZERO_BD);
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
  let price0 = BigInt(token0.derivedETH) * BigInt(bundle.ethPrice);
  let price1 = BigInt(token1.derivedETH) * BigInt(bundle.ethPrice);

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return (BigInt(tokenAmount0) * price0) + (BigInt(tokenAmount1) * price1);
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return BigInt(tokenAmount0) * price0 * BigInt(2);
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return BigInt(tokenAmount1) * price1 * BigInt(2);
  }

  // neither token is on white list, tracked volume is 0
  return BigInt(ZERO_BD);
}

module.exports = {
  getEthPriceInUSD,
  findEthPerToken,
  getTrackedVolumeUSD,
  getTrackedLiquidityUSD,
};
