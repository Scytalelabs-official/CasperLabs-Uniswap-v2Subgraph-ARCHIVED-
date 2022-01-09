var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const userSchema = new Schema({

    // user address
    id: {
        type: String,
    },
    usdSwapped: {
        type: String,
    },
    liquidityPositions: [{type:String}]
});

var user = mongoose.model("user", userSchema);
module.exports = user;
