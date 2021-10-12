var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var tokenDayData= require('./tokenDayData');
var pairDayData= require('./pairDayData');
var pair= require('./pair');

const tokenSchema = new Schema({

  //token address
  id: {
    type: String,
  },

  // mirrored from the smart contract
  symbol: {
    type: String,
  },
  name: {
    type: String,
  },
  decimals: {
    type: Number,
  },
  // used for other stats like marketcap
  totalSupply: {
    type: Number,
  },

  //token specific volume
  tradeVolume: {
    type: Number,
  },
  tradeVolumeUSD: {
    type: Number,
  },
  untrackedVolumeUSD: {
    type: Number,
  },

  //transactions across all pairs
  txCount: {
    type: Number,
  },

  //liquidity across all pairs
  totalLiquidity: {
    type: Number,
  },

  //derived prices
  derivedETH: {
    type: Number,
  },

  mostLiquidPairs: [pairDayData],
  // derived fields
  tokenDayData:[tokenDayData], // @derivedFrom(field: "token")
  pairDayDataBase: [pairDayData], //@derivedFrom(field: "token0")
  pairDayDataQuote: [pairDayData], //@derivedFrom(field: "token1")
  pairBase: [pair], //@derivedFrom(field: "token0")
  pairQuote: [pair], //@derivedFrom(field: "token1")
  
});

var token = mongoose.model("token", tokenSchema);
module.exports = token;
