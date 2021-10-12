var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mint=require('./mint');
var burn=require('./burn');
var swap=require('./swap');

const transactionSchema = new Schema({

    id: {
        type: String,
    },// txn hash

    blockNumber: {
        type: Number,
    },

    timestamp: {
        type: Number,
    },

    // This is not the reverse of Mint.transaction; it is only used to
    // track incomplete mints (similar for burns and swaps)
    mints: [mint],
    burns: [burn],
    swaps: [swap]
    
});

var transaction = mongoose.model("transaction", transactionSchema);
module.exports = transaction;
