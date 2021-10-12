var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var token=require('./token');

const tokenDayDataSchema = new Schema({

  id:{
    type:String
  },

  date: {
      type:Number
  },

  token: token,

  // volume stats
  dailyVolumeToken: {
    type:Number
  },
  dailyVolumeETH: {
    type:Number
  },
  dailyVolumeUSD: {
    type:Number
  },
  dailyTxns: {
    type:Number
  },

  // liquidity stats
  totalLiquidityToken: {
    type:Number
  },
  totalLiquidityETH: {
    type:Number
  },
  totalLiquidityUSD: {
    type:Number
  },
  
  // price stats
  priceUSD: {
    type:Number
  }

});

var tokenDayData = mongoose.model("tokenDayData", tokenDayDataSchema);
module.exports = tokenDayData;
