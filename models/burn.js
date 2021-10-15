var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const burnSchema = new Schema({

    //transaction hash + "-" + index in mints Transaction array
    id:{
      type:String
    },

    transaction: {
       type : String
    },

    timestamp:{
      type:Number
    }, //need this to pull recent txns for specific token or pair

    pair:{ 
      type : String
    },

    // populated from the primary Transfer event
  
    liquidity:{
      type:Number
    },

    // populated from the Burn event
    sender:{
      type:String
    },
    amount0:{
      type:Number
    },
    amount1:{
      type:Number
    },
    to:{
      type:String
    },
    logIndex:{
      type:Number
    },

    // derived amount based on available prices of tokens
    amountUSD:{
      type:Number
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
      type:Number
    }
  
});

var burn = mongoose.model("burn", burnSchema);
module.exports = burn;
