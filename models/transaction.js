var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const transactionSchema = new Schema({

    id: {
        type: String,
    },// txn hash

    blockNumber: {
        type: String,
    },

    timestamp: {
        type: Number,
    },

    // This is not the reverse of Mint.transaction; it is only used to
    // track incomplete mints (similar for burns and swaps)

    mints: [{ type : String}],
    burns: [{ type : String}],
    swaps: [{ type : String}]
    
});

var transaction = mongoose.model("transaction", transactionSchema);
module.exports = transaction;
