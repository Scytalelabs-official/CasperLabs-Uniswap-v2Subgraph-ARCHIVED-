var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const pairHourDataSchema = new Schema({

    id:{
      type:String
    },

    hourStartUnix: {
      type:Number
    },// unix timestamp for start of hour

    pair: { 
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
    hourlyVolumeToken0: {
      type:String
    },
    hourlyVolumeToken1: {
      type:String
    },
    hourlyVolumeUSD: {
      type:String
    },
    hourlyTxns: {
      type:String
    }
  
});

var pairHourData = mongoose.model("pairHourData", pairHourDataSchema);
module.exports = pairHourData;
