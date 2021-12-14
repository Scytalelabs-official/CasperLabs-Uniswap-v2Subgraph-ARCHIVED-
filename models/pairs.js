var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const pairsSchema = new Schema({

    id: {type: String, default: 'pair'},
    data: [{type: String}]
    
});

var pairs = mongoose.model("pairs", pairsSchema);
module.exports = pairs;
