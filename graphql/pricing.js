const Pair = require("../models/pair");
const Bundle = require("../models/bundle");
const rp = require("request-promise");
var bigdecimal = require("bigdecimal");
require("dotenv").config();

const {
  ZERO_BD,
  ONE_BD,
} = require("./helpers");

async function getCSPRPriceInUSD() {
  const requestOptions = {
    method: "GET",
    uri: "https://pro-api.coinmarketcap.com/v1/tools/price-conversion",
    qs: {
      amount: "1",
      symbol: "CSPR",
      convert: "USD",
    },
    headers: {
      "X-CMC_PRO_API_KEY": process.env.COIN_MARKET_CAP_API_KEY,
    },
    json: true,
    gzip: true,
  };

  rp(requestOptions)
    .then((response) => {
      console.log("CSPR price in USD = ", response.data.quote.USD.price);
      return (response.data.quote.USD.price).toString();
    })
    .catch((err) => {
      console.log("API call error:", err.message);
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    });
}

async function findCSPRPerToken(token) {

  if (token.id == process.env.WCSPR_PACKAGE) {
        return ONE_BD;
  }
  let pairAddress= null;
  let pairs = await Pair.find({});
  for (var j=0; j< pairs.length;j++)
  {
    if (pairs[j].token0.id == token.id)
    {
      if (pairs[j].token1.id == process.env.WCSPR_PACKAGE)
      {
        pairAddress=pairs[j].id;
        let pair = await Pair.findOne({ id: pairAddress });
        console.log("pair.token1Price * 1: ",pair.token1Price * 1);
        return (new bigdecimal.BigDecimal(pair.token1Price).multiply(new bigdecimal.BigDecimal("1"))).toString();
      }
    }
    else if (pairs[j].token0.id == process.env.WCSPR_PACKAGE)
    {
      if (pairs[j].token1.id == token.id)
      {
        pairAddress=pairs[j].id;
        let pair = await Pair.findOne({ id: pairAddress });
        console.log("pair.token0Price * 1 : ",pair.token0Price * 1);
        return (new bigdecimal.BigDecimal(pair.token0Price).multiply(new bigdecimal.BigDecimal("1"))).toString();
      }
    }
  }

}


// token where amounts should contribute to tracked volume and liquidity
let WHITELIST = [
 
  "ecf3cc9c1cd2ad830c7e57d89c35d6e96b3f480ee26b4e084d583e06875018cd".toLowerCase(),// WCSPR
  "3e57a3cea8dcdfb642fd54203a45bee862c049594c6966551be2cfc0416dfd89".toLowerCase(),//WISE

];

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
let MINIMUM_USD_THRESHOLD_NEW_PAIRS = new bigdecimal.BigDecimal("400000000000000");

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_ETH = new bigdecimal.BigDecimal("2000000000");

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
  let price0 = new bigdecimal.BigDecimal(token0.derivedETH).multiply(new bigdecimal.BigDecimal(bundle.ethPrice));
  let price1 = new bigdecimal.BigDecimal(token1.derivedETH).multiply(new bigdecimal.BigDecimal(bundle.ethPrice));


  // if less than 5 LPs, require high minimum reserve amount amount or return 0
  if (new bigdecimal.BigDecimal(pair.liquidityProviderCount) < new bigdecimal.BigDecimal(5)) {
    let reserve0USD = new bigdecimal.BigDecimal(pair.reserve0).multiply(price0);
    let reserve1USD = new bigdecimal.BigDecimal(pair.reserve1).multiply(price1);
    if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve0USD.add(reserve1USD) < MINIMUM_USD_THRESHOLD_NEW_PAIRS) {
        return new bigdecimal.BigDecimal(ZERO_BD);
      }
    }
    if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
      if (reserve0USD.multiply(new bigdecimal.BigDecimal(2)) < MINIMUM_USD_THRESHOLD_NEW_PAIRS) {
        return new bigdecimal.BigDecimal(ZERO_BD);
      }
    }
    if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      if (reserve1USD.multiply(new bigdecimal.BigDecimal(2)) < MINIMUM_USD_THRESHOLD_NEW_PAIRS) {
        return new bigdecimal.BigDecimal(ZERO_BD);
      }
    }
  }

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.multiply(price0).add(tokenAmount1.multiply(price1)).divide(new bigdecimal.BigDecimal(2));
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.multiply(price0);
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.multiply(price1);
  }

  // neither token is on white list, tracked volume is 0
  return new bigdecimal.BigDecimal(ZERO_BD);
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
  let price0 = new bigdecimal.BigDecimal(token0.derivedETH).multiply(new bigdecimal.BigDecimal(bundle.ethPrice));
  let price1 = new bigdecimal.BigDecimal(token1.derivedETH).multiply(new bigdecimal.BigDecimal(bundle.ethPrice));

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return new bigdecimal.BigDecimal(tokenAmount0).multiply(price0).add(new bigdecimal.BigDecimal(tokenAmount1).multiply(price1));
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return new bigdecimal.BigDecimal(tokenAmount0).multiply(price0).multiply(new bigdecimal.BigDecimal(2));
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return new bigdecimal.BigDecimal(tokenAmount1).multiply(price1).multiply(new bigdecimal.BigDecimal(2));
  }

  // neither token is on white list, tracked volume is 0
  return new bigdecimal.BigDecimal(ZERO_BD);
}

module.exports = {
  getCSPRPriceInUSD,
  findCSPRPerToken,
  getTrackedVolumeUSD,
  getTrackedLiquidityUSD,
};
