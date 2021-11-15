var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const liquidityPositionSchema = new Schema({

    id: {
        type: String,
    },
    user: { 
        id:{
            type : String
        }
    },

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
        totalSupply:{
            type : Number
        },
        token0:{
            id:{
                type : String
            },
            symbol:{
                type : String
            },
            derivedETH:{
                type : Number
            }
        },
        token1:{
            id:{
                type : String
            },
            symbol:{
                type : String
            },
            derivedETH:{
                type : Number
            }
        }
    }, // reference to pair
    
    liquidityTokenBalance:{
        type: Number,
    }
});

var liquidityPosition = mongoose.model("liquidityPosition", liquidityPositionSchema);
module.exports = liquidityPosition;
