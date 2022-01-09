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
      type:String
    },
    reserve1: {
      type:String
    },

    // total supply for LP historical returns
    totalSupply: {
      type:String
    },

    // derived liquidity
    reserveUSD: {
      type:String
    },

    // volume stats
    dailyVolumeToken0: {
      type:String
    },
    dailyVolumeToken1: {
      type:String
    },
    dailyVolumeUSD: {
      type:String
    },
    dailyTxns: {
      type:String
    }
  
});

var pairDayData = mongoose.model("pairDayData", pairDayDataSchema);
module.exports = pairDayData;
