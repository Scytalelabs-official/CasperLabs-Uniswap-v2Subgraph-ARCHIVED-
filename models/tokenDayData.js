var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const tokenDayDataSchema = new Schema({

    id:{
      type:String
    },

    date: {
        type:Number
    },

    token: { 
      type : String
    },

    // volume stats
    dailyVolumeToken: {
      type:String
    },
    dailyVolumeETH: {
      type:String
    },
    dailyVolumeUSD: {
      type:String
    },
    dailyTxns: {
      type:String
    },

    // liquidity stats
    totalLiquidityToken: {
      type:String
    },
    totalLiquidityETH: {
      type:String
    },
    totalLiquidityUSD: {
      type:String
    },
    
    // price stats
    priceUSD: {
      type:String
    },
    
    mostLiquidPairs : [{ type : String}]

});

var tokenDayData = mongoose.model("tokenDayData", tokenDayDataSchema);
module.exports = tokenDayData;
