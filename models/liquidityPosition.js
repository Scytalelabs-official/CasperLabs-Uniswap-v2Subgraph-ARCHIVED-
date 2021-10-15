var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const liquidityPositionSchema = new Schema({

    id: {
        type: String,
    },
    user: { 
        type : String
    },

    pair: { 
        type : String
    },
    
    liquidityTokenBalance:{
        type: Number,
    }
});

var liquidityPosition = mongoose.model("liquidityPosition", liquidityPositionSchema);
module.exports = liquidityPosition;
