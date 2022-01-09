var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const uniswapFactorySchema = new Schema({

    //factory address
    id: {
      type: String,
    },

    // pair info
    pairCount: {
      type: String,
    },

    // total volume
    totalVolumeUSD: {
      type: String,
    },
    totalVolumeETH: {
      type: String,
    },

    //untracked values - less confident USD scores
    untrackedVolumeUSD: {
      type: String,
    },

    //total liquidity
    totalLiquidityUSD: {
      type: String,
    },
    totalLiquidityETH: {
      type: String,
    },

    //transactions
    txCount: {
      type: String
    },

    mostLiquidTokens: [{ type : String}]

});

var uniswapFactory = mongoose.model("uniswapFactory", uniswapFactorySchema);
module.exports = uniswapFactory;
