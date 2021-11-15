var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const transactionSchema = new Schema({

    id: {
        type: String,
    },// txn hash

    blockNumber: {
        type: String,
    },

    timestamp: {
        type: Number,
    },

    // This is not the reverse of Mint.transaction; it is only used to
    // track incomplete mints (similar for burns and swaps)

    mints: [
        {
            id:{
                type:String
            },
            transactionid:{
                type : String
            },
            transactiontimestamp:{
                type : Number
            },
            pair: { 
                id:{
                  type : String
                },
                token0:{
                  id:{
                    type : String
                  },
                  symbol:{
                    type : String
                  }
                },
                token1:{
                  id:{
                    type : String
                  },
                  symbol:{
                    type : String
                  }
                }
            },
            to:{
                type:String
            },
            liquidity:{
                type:Number
            },
            timestamp:{
              type:Number
            },
            amount0:{
                type:Number
            },
            amount1:{
                type:Number
            },
            amountUSD:{
                type:Number
            },
            
        }
    ],
    burns: [
        {
            id:{
                type:String
            },
            transactionid:{
                type : String
            },
            transactiontimestamp:{
                type : Number
            },
            pair: { 
                id:{
                  type : String
                },
                token0:{
                  id:{
                    type : String
                  },
                  symbol:{
                    type : String
                  }
                },
                token1:{
                  id:{
                    type : String
                  },
                  symbol:{
                    type : String
                  }
                }
            },
            sender:{
                type:String
            },
            to:{
                type:String
            },
            liquidity:{
                type:Number
            },
            timestamp:{
              type:Number
            },
            amount0:{
                type:Number
            },
            amount1:{
                type:Number
            },
            amountUSD:{
                type:Number
            },
            needsComplete:{
              type:Boolean
            },
        }
    ],
    swaps: [
        {
            id:{
                type:String
            },
            transactionid:{
                type : String
            },
            transactiontimestamp:{
                type : Number
            },
            pair: { 
                id:{
                  type : String
                },
                token0:{
                  id:{
                    type : String
                  },
                  symbol:{
                    type : String
                  }
                },
                token1:{
                  id:{
                    type : String
                  },
                  symbol:{
                    type : String
                  }
                }
            },
            to:{
                type:String
            },
            amount0In:{
                type:Number
            },
            amount1In:{
                type:Number
            },
            amount0Out:{
                type:Number
            },
            amount1Out:{
                type:Number
            },
            amountUSD:{
                type:Number
            }
        }
    ]
    
});

var transaction = mongoose.model("transaction", transactionSchema);
module.exports = transaction;
