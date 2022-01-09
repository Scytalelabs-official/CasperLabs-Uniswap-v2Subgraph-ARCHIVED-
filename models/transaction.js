var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const transactionSchema = new Schema({

    id: {
        type: String,
    },// txn hash

    blockString: {
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
                type:String
            },
            timestamp:{
              type:Number
            },
            amount0:{
                type:String
            },
            amount1:{
                type:String
            },
            amountUSD:{
                type:String
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
                type:String
            },
            timestamp:{
              type:Number
            },
            amount0:{
                type:String
            },
            amount1:{
                type:String
            },
            amountUSD:{
                type:String
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
                type:String
            },
            amount1In:{
                type:String
            },
            amount0Out:{
                type:String
            },
            amount1Out:{
                type:String
            },
            amountUSD:{
                type:String
            }
        }
    ]
    
});

var transaction = mongoose.model("transaction", transactionSchema);
module.exports = transaction;
