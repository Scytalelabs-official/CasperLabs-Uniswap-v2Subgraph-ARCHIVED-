var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const pairagainstuserSchema = new Schema({
  id: { type: String },
  pair: { type: String },
  reserve0: { type: String },
  reserve1: { type: String },
});

var pairagainstuser = mongoose.model("pairagainstuser", pairagainstuserSchema);
module.exports = pairagainstuser;
