var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const liquidityPositionSchema = new Schema({

    id: {
        type: String,
    },
    user: { id:{
        type : String
    }
        
    },

    pair: { 
        id:{
            type : String
        },
        reserve0:{
            type : String
        },
        reserve1:{
            type : String
        },
        reserveUSD:{
            type : String
        },
        totalSupply:{
            type : String
        },
        token0:{
            id:{
                type : String
            },
            symbol:{
                type : String
            },
            derivedETH:{
                type : String
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
                type : String
            }
        }
    }, // reference to pair
    
    liquidityTokenBalance:{
        type: String,
    }
});

var liquidityPosition = mongoose.model("liquidityPosition", liquidityPositionSchema);
module.exports = liquidityPosition;
