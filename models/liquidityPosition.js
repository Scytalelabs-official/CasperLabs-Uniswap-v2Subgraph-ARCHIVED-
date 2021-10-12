var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var user=require('./user');
var pair=require('./pair');

const liquidityPositionSchema = new Schema({

    id: {
        type: String,
    },
    user: user,

    pair: pair,
    
    liquidityTokenBalance:{
        type: Number,
    }
});

var liquidityPosition = mongoose.model("liquidityPosition", liquidityPositionSchema);
module.exports = liquidityPosition;
