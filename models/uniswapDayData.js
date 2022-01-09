var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const uniswapDayDataSchema = new Schema({

    id:{
      type:String
    },// timestamp rounded to current day by dividing by 86400

    date: {
        type:Number
    },

    dailyVolumeETH: {
      type:String
    },
    dailyVolumeUSD: {
      type:String
    },
    dailyVolumeUntracked: {
      type:String
    },

    totalVolumeETH: {
      type:String
    },
    totalLiquidityETH: {
      type:String
    },
    totalVolumeUSD: {
      type:String
    }, // Accumulate at each trade, not just calculated off whatever totalVolume is. making it more accurate as it is a live conversion
    totalLiquidityUSD: {
      type:String
    },

    txCount: {
      type:String
    }
  
});

var uniswapDayData = mongoose.model("uniswapDayData", uniswapDayDataSchema);
module.exports = uniswapDayData;
