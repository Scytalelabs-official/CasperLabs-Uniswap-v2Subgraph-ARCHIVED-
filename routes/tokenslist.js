var express = require("express");
var router = express.Router();
var tokensListModel = require("../models/tokensList");

router.route("/tokensList").get(async function (req, res, next) {
  try {
    var tokensList = await tokensListModel.findOne({});
    if (tokensList == null) {
      return res.status(400).json({
        success: false,
        message: "There is no data in tokensList Collection.",
      });
    } else {
      return res.send(tokensList.data);
    }
  } catch (error) {
    console.log("error (try-catch) : " + error);
    return res.status(500).json({
      success: false,
      err: error,
    });
  }
});
module.exports = router;
