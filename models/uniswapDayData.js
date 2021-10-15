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
      type:Number
    },
    dailyVolumeUSD: {
      type:Number
    },
    dailyVolumeUntracked: {
      type:Number
    },

    totalVolumeETH: {
      type:Number
    },
    totalLiquidityETH: {
      type:Number
    },
    totalVolumeUSD: {
      type:Number
    }, // Accumulate at each trade, not just calculated off whatever totalVolume is. making it more accurate as it is a live conversion
    totalLiquidityUSD: {
      type:Number
    },

    txCount: {
      type:Number
    }
  
});

var uniswapDayData = mongoose.model("uniswapDayData", uniswapDayDataSchema);
module.exports = uniswapDayData;
