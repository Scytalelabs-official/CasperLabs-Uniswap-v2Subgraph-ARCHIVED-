const UniswapFactory = require("../models/uniswapFactory");
const PairDayData = require("../models/pairDayData");
const PairHourData = require("../models/pairHourData");
const UniswapDayData = require("../models/uniswapDayData");
const TokenDayData = require("../models/tokenDayData");
const Pair = require("../models/pair");
const Token = require("../models/token");
const Bundle = require("../models/bundle");

const {
  
  ZERO_BD,
  ZERO_BI,
  ONE_BI,
 
} = require("./helpers");

async function updateUniswapDayData (timeStamp) {
  
    try {
      console.log("hello.");
      let uniswap = await UniswapFactory.findOne({
        id: process.env.FACTORY_CONTRACT,
      });
      
      let timestamp = timeStamp;
      let dayID = timestamp / 86400;
      let dayStartTimestamp = dayID * 86400;
      let uniswapDayData = await UniswapDayData.findOne({
        id: dayID.toString(),
      });
      if (uniswapDayData === null) {
          let newData = new UniswapDayData({
          id: (parseInt(dayID)).toString(),
          date: parseInt(dayStartTimestamp),
          dailyVolumeUSD: ZERO_BD,
          dailyVolumeETH: ZERO_BD,
          totalVolumeUSD: ZERO_BD,
          totalVolumeETH: ZERO_BD,
          dailyVolumeUntracked: ZERO_BD,
          uniswapDaytotalLiquidityUSD : uniswap.totalLiquidityUSD,
          totalLiquidityETH : uniswap.totalLiquidityETH,
          txCount : uniswap.txCount
        });
        let newdocument = await UniswapDayData.create(newData);
        console.log("newdocument: ",newdocument);
        return newdocument;
      }
      uniswapDayData.totalLiquidityUSD = uniswap.totalLiquidityUSD;
      uniswapDayData.totalLiquidityETH = uniswap.totalLiquidityETH;
      uniswapDayData.txCount = uniswap.txCount;
      await uniswapDayData.save();

      console.log("uniswapDayData: ",uniswapDayData);
      
      return uniswapDayData;

    } catch (error) {
      throw new Error(error);
    }

}

async function updatePairDayData (timeStamp,pairAddress){
 
    try {
     
      let timestamp = timeStamp;
      let dayID = timestamp / 86400;
      let dayStartTimestamp = dayID * 86400;

      let dayPairID = pairAddress + "-" + (parseInt(dayID)).toString();
      let pair = await Pair.findOne({ id: pairAddress });
      let pairDayData = await PairDayData.findOne({ id: dayPairID });
      if (pairDayData === null) {
        let newData = new PairDayData({
          id: dayPairID,
          date: parseInt(dayStartTimestamp),
          token0: pair.token0.id,
          token1: pair.token1.id,
          pairAddress: pairAddress,
          dailyVolumeToken0: ZERO_BD,
          dailyVolumeToken1: ZERO_BD,
          dailyVolumeUSD: ZERO_BD,
          dailyTxns: ZERO_BI,
          totalSupply : pair.totalSupply,
          reserve0 : pair.reserve0,
          reserve1 : pair.reserve1,
          reserveUSD : pair.reserveUSD,
          dailyTxns : ONE_BI
        });
        let newdocument = await PairDayData.create(newData);
        console.log("newdocument: ",newdocument);
        return newdocument;
      }
      pairDayData.totalSupply = pair.totalSupply;
      pairDayData.reserve0 = pair.reserve0;
      pairDayData.reserve1 = pair.reserve1;
      pairDayData.reserveUSD = pair.reserveUSD;
      pairDayData.dailyTxns = pairDayData.dailyTxns + ONE_BI;
      await pairDayData.save();

      console.log("pairDayData: ",pairDayData);

      return pairDayData;
    } catch (error) {
      throw new Error(error);
    }

}

async function updatePairHourData (timeStamp,pairAddress){
  
    try {
    
      let timestamp = timeStamp;
      let hourIndex = timestamp / 3600; // get unique hour within unix history
      let hourStartUnix = hourIndex * 3600; // want the rounded effect
     
      let hourPairID = pairAddress + "-" + (parseInt(hourIndex)).toString();
      let pair = await Pair.findOne({ id: pairAddress });
      let pairHourData = await PairHourData.findOne({ id: hourPairID });
      if (pairHourData === null) {
        let newData = new PairHourData({
          id: hourPairID,
          hourStartUnix: parseInt(hourStartUnix),
          pair: pairAddress,
          hourlyVolumeToken0: ZERO_BD,
          hourlyVolumeToken1: ZERO_BD,
          hourlyVolumeUSD: ZERO_BD,
          hourlyTxns : ZERO_BI,
          totalSupply : pair.totalSupply,
          reserve0 : pair.reserve0,
          reserve1 : pair.reserve1,
          reserveUSD : pair.reserveUSD,
          hourlyTxns : ONE_BI
        });
        let newdocument = await PairHourData.create(newData);
        console.log("newdocument: ",newdocument);
        return newdocument;
      }

      pairHourData.totalSupply = pair.totalSupply;
      pairHourData.reserve0 = pair.reserve0;
      pairHourData.reserve1 = pair.reserve1;
      pairHourData.reserveUSD = pair.reserveUSD;
      pairHourData.hourlyTxns = pairHourData.hourlyTxns + ONE_BI;
      await pairHourData.save();

      console.log("pairHourData: ",pairHourData);

      return pairHourData;
    } catch (error) {
      throw new Error(error);
    }

}

async function updateTokenDayData (token,timeStamp) {
    try {

      let bundle = await Bundle.findOne({ id: "1" });
      let timestamp = timeStamp;
      let dayID = timestamp / 86400;
      let dayStartTimestamp = dayID * 86400;

      let tokenDayID = token.id+ "-"+ (parseInt(dayID)).toString();

      let tokenDayData = await TokenDayData.findOne({ id: tokenDayID });
      let tokendata = await Token.findOne({ id: token.id });
      if (tokenDayData === null) {
        let newData = new TokenDayData({
          id: tokenDayID,
          date: parseInt(dayStartTimestamp),
          token: token.id,
          priceUSD: tokendata.derivedETH * bundle.ethPrice,
          dailyVolumeToken: ZERO_BD,
          dailyVolumeETH: ZERO_BD,
          dailyVolumeUSD: ZERO_BD,
          dailyTxns: ZERO_BI,
          totalLiquidityUSD: ZERO_BD,
          priceUSD : tokendata.derivedETH * bundle.ethPrice,
          totalLiquidityToken : tokendata.totalLiquidity,
          totalLiquidityETH : tokendata.totalLiquidity * tokendata.derivedETH,
          totalLiquidityUSD : (tokendata.totalLiquidity * tokendata.derivedETH) * bundle.ethPrice,
          dailyTxns : ONE_BI
        });
        let newdocument = await TokenDayData.create(newData);
        console.log("newdocument: ",newdocument);
        return newdocument;
      }

      tokenDayData.priceUSD = tokendata.derivedETH * bundle.ethPrice;
      tokenDayData.totalLiquidityToken = tokendata.totalLiquidity;
      tokenDayData.totalLiquidityETH =
        tokendata.totalLiquidity * tokendata.derivedETH;
      tokenDayData.totalLiquidityUSD =
        tokenDayData.totalLiquidityETH * bundle.ethPrice;
      tokenDayData.dailyTxns = tokenDayData.dailyTxns + ONE_BI;
      await tokenDayData.save();

      console.log("tokenDayData: ",tokenDayData);

      return tokenDayData;
    } catch (error) {
      throw new Error(error);
    }

}

module.exports = {
    updateUniswapDayData,
    updatePairDayData,
    updatePairHourData,
    updateTokenDayData,
};