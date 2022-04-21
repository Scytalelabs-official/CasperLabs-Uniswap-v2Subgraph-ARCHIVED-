var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const removeReservesDataSchema = new Schema({
  user: {
    type: String,
  },
  deployHash: {
    type: String,
  }
  
});

var removeReservesData = mongoose.model(
  "removeReservesData",
  removeReservesDataSchema
);
module.exports = removeReservesData;
