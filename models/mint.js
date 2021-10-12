var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var pair= require('./pair');
var transaction= require('./transaction');

const mintSchema = new Schema({

  //transaction hash + "-" + index in mints Transaction array
  id:{
    type:String
  },

  transaction: transaction,

  timestamp:{
    type:Number
  }, //need this to pull recent txns for specific token or pair

  pair: pair,

  // populated from the primary Transfer event
  to:{
    type:String
  },
  liquidity:{
    type:Number
  },

  // populated from the Mint event
  sender:{
    type:String
  },
  amount0:{
    type:Number
  },
  amount1:{
    type:Number
  },
  logIndex:{
    type:Number
  },
  // derived amount based on available prices of tokens
  amountUSD:{
    type:Number
  },

  // optional fee fields, if a Transfer event is fired in _mintFee
  feeTo:{
    type:String
  },
  feeLiquidity:{
    type:Number
  }
  
});

var mint = mongoose.model("mint", mintSchema);
module.exports = mint;
