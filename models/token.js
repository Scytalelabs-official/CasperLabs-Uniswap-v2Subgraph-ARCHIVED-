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
      type: String,
    },

    //token specific volume
    tradeVolume: {
      type: String,
    },
    tradeVolumeUSD: {
      type: String,
    },
    untrackedVolumeUSD: {
      type: String,
    },

    //transactions across all pairs
    txCount: {
      type: String,
    },

    //liquidity across all pairs
    totalLiquidity: {
      type: String,
    },

    //derived prices
    derivedETH: {
      type: String,
    },

    mostLiquidPairs : [{
       type: String 
    }]
    
});

var token = mongoose.model("token", tokenSchema);
module.exports = token;
