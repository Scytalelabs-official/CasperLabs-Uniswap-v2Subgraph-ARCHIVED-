var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const approveDataSchema = new Schema({
  user: {
    type: String,
  },
  deployHash: {
    type: String,
  },
});

var approveData = mongoose.model("approveData", approveDataSchema);
module.exports = approveData;
