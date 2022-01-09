var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const swapSchema = new Schema({

    //transaction hash + "-" + index in swap Transaction array
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

    timestamp:{
      type:Number
    }, //need this to pull recent txns for specific token or pair


    // populated from the Swap event
    sender:{
      type:String
    },
    from:{
      type:String
    },//the EOA that initiated the txn
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
    to:{
      type:String
    },
    logIndex:{
      type:Number
    },
    
    // derived amount based on available prices of tokens
    amountUSD:{
      type:String
    }
  
});

var swap = mongoose.model("swap", swapSchema);
module.exports = swap;
