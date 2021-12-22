var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const tokensListSchema = new Schema({

    //tokens Data
    data: {
      type: Object,
    }
    
});

var tokensList = mongoose.model("tokensList", tokensListSchema);
module.exports = tokensList;
