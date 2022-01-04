var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const pairsagainstuserSchema = new Schema({

    pairContractHash:{type:String},
    user:{type:String}
});

var pairsagainstuser = mongoose.model("pairsagainstuser", pairsagainstuserSchema);
module.exports = pairsagainstuser;
