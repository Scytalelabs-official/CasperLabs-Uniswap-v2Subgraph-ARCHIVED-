var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var liquidityPosition=require('./liquidityPosition');

const userSchema = new Schema({

    // user address
    id: {
        type: String,
    },
    liquidityPositions: [liquidityPosition], // @derivedFrom(field: "user")
    usdSwapped: {
        type: Number,
    },
});

var user = mongoose.model("user", userSchema);
module.exports = user;
