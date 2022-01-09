var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const bundleSchema = new Schema({

    id:{
      type:String
    },

    ethPrice:{
      type:String
    } // price of ETH usd
  
});

var bundle = mongoose.model("bundle", bundleSchema);
module.exports = bundle;
