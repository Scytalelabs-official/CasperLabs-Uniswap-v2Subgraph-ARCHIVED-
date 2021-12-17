var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const eventSchema = new Schema({

    deployHash: {
        type: String
    },
    timestamp: {
        type: Number
    },
    block_hash: {
        type: String
    },
    eventName:{
        type: String
    },
    pairContractHash:{
        type: String
    },
    eventsdata:{
        type: Object
    }
   
});

var event = mongoose.model("event", eventSchema);
module.exports = event;
