var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const liquidityPositionSnapshotSchema = new Schema({

    id: {
        type: String,
    },

    liquidityPosition: [{ type : String}],

    timestamp:{
        type: Number,
    },// saved for fast historical lookups
    
    block:{
        type: String,
    },// saved for fast historical lookups

    user: { 
        type : String
    }, // reference to user

    pair: { 
        id:{
            type : String
        },
        reserve0:{
            type : Number
        },
        reserve1:{
            type : Number
        },
        reserveUSD:{
            type : Number
        },
        token0:{
            id:{
                type : String
            }
        },
        token1:{
            id:{
                type : String
            }
        }
    }, // reference to pair

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
