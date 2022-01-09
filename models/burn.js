var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const burnSchema = new Schema({

    //transaction hash + "-" + index in mints Transaction array
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

    liquidity:{
      type:String
    },

    // populated from the Burn event
    sender:{
      type:String
    },
    amount0:{
      type:String
    },
    amount1:{
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
    },
    
    // mark uncomplete in ETH case
    needsComplete:{
        type:Boolean
    },
    
    // optional fee fields, if a Transfer event is fired in _mintFee
    feeTo:{
      type:String
    },
    feeLiquidity:{
      type:String
    }
  
});

var burn = mongoose.model("burn", burnSchema);
module.exports = burn;
