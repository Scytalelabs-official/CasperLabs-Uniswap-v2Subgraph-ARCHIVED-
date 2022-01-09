var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const mintSchema = new Schema({

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

    // populated from the primary Transfer event
    to:{
      type:String
    },
    liquidity:{
      type:String
    },

    // populated from the Mint event
    sender:{
      type:String
    },
    amount0:{
      type:String
    },
    amount1:{
      type:String
    },
    logIndex:{
      type:Number
    },
    // derived amount based on available prices of tokens
    amountUSD:{
      type:String
    },

    // optional fee fields, if a Transfer event is fired in _mintFee
    feeTo:{
      type:String
    },
    feeLiquidity:{
      type:String
    }
  
});

var mint = mongoose.model("mint", mintSchema);
module.exports = mint;
