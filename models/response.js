var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const responseSchema = new Schema({

    id:{
      type:String
    },

    result:{
      type:Boolean
    }
  
});

var response = mongoose.model("response", responseSchema);
module.exports = response;
