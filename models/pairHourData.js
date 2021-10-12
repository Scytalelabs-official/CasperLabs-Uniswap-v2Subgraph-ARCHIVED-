var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var pair= require('./pair');

const pairHourDataSchema = new Schema({

  id:{
    type:String
  },

  hourStartUnix: {
    type:Number
  },// unix timestamp for start of hour

  pair: pair,

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
  hourlyVolumeToken0: {
    type:Number
  },
  hourlyVolumeToken1: {
    type:Number
  },
  hourlyVolumeUSD: {
    type:Number
  },
  hourlyTxns: {
    type:Number
  }
  
});

var pairHourData = mongoose.model("pairHourData", pairHourDataSchema);
module.exports = pairHourData;
