var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const pairDayDataSchema = new Schema({

    id:{
      type:String
    },
    
    date: {
      type:Number
    },

    pairAddress:{
      type:String
    },

    token0: {
       type : String
    },
    
    token1: { 
      type : String
    },

    // reserves
    reserve0: {
      type:Number
    },
    reserve1: {
      type:Number
    },

    // total supply for LP historical returns
    totalSupply: {
      type:Number
    },

    // derived liquidity
    reserveUSD: {
      type:Number
    },

    // volume stats
    dailyVolumeToken0: {
      type:Number
    },
    dailyVolumeToken1: {
      type:Number
    },
    dailyVolumeUSD: {
      type:Number
    },
    dailyTxns: {
      type:Number
    }
  
});

var pairDayData = mongoose.model("pairDayData", pairDayDataSchema);
module.exports = pairDayData;
