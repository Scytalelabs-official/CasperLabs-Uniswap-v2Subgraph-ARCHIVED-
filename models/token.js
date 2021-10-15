var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

    mostLiquidPairs : [{
       type: String 
    }]
    
});

var token = mongoose.model("token", tokenSchema);
module.exports = token;
