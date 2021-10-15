var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const uniswapFactorySchema = new Schema({

    //factory address
    id: {
      type: String,
    },

    // pair info
    pairCount: {
      type: Number,
    },

    // total volume
    totalVolumeUSD: {
      type: Number,
    },
    totalVolumeETH: {
      type: Number,
    },

    //untracked values - less confident USD scores
    untrackedVolumeUSD: {
      type: Number,
    },

    //total liquidity
    totalLiquidityUSD: {
      type: Number,
    },
    totalLiquidityETH: {
      type: Number,
    },

    //transactions
    txCount: {
      type: Number
    },

    mostLiquidTokens: [{ type : String}]

});

var uniswapFactory = mongoose.model("uniswapFactory", uniswapFactorySchema);
module.exports = uniswapFactory;
