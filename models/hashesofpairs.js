var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const hashesofpairsSchema = new Schema({
    
    contractHash:{type: String},
    packageHash:{type: String}
    
});

var hashesofpairs = mongoose.model("hashesofpairs", hashesofpairsSchema);
module.exports = hashesofpairs;
