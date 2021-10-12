var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var user=require('./user');
var pair=require('./pair');
var liquidityPosition=require('./liquidityPosition');

const liquidityPositionSnapshotSchema = new Schema({

    id: {
        type: String,
    },

    liquidityPosition: liquidityPosition,

    timestamp:{
        type: Number,
    },// saved for fast historical lookups
    
    block:{
        type: Number,
    },// saved for fast historical lookups

    user: user, // reference to user

    pair: pair, // reference to pair

    token0PriceUSD:{
        type: Number,
    }, //snapshot of token0 price

    token1PriceUSD:{
        type: Number,
    }, //snapshot of token1 price

    reserve0:{
        type: Number,
    }, //snapshot of pair token0 reserves

    reserve1:{
        type: Number,
    }, //snapshot of pair token1 reserves

    reserveUSD:{
        type: Number,
    }, //snapshot of pair reserves in USD

    liquidityTokenTotalSupply:{
        type: Number,
    }, // snapshot of pool token supply
    
    liquidityTokenBalance:{
        type: Number,
    }, // snapshot of users pool token balance
    
});

var liquidityPositionSnapshot = mongoose.model("liquidityPositionSnapshot", liquidityPositionSnapshotSchema);
module.exports = liquidityPositionSnapshot;
