var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const allcontractsDataSchema = new Schema({
    
    contractHash:{type: String},
    packageHash:{type: String}
    
});

var allcontractsData = mongoose.model("allcontractsData", allcontractsDataSchema);
module.exports = allcontractsData;
