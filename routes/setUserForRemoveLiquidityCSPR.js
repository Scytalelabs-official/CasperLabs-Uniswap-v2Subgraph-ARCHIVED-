require("dotenv").config();
var express = require("express");
var router = express.Router();
var RemoveReservesDataModel = require("../models/removeReservesData");

router
  .route("/setUserForRemoveLiquidityCSPR")
  .post(async function (req, res, next) {
    try {
      if (!req.body.user) {
        return res.status(400).json({
          success: false,
          message: "user did not found in the request body.",
        });
      }
      if (!req.body.deployHash) {
        return res.status(400).json({
          success: false,
          message: "deployHash did not found in the request body."
        });
      }
      let newData = new RemoveReservesDataModel({
        user: req.body.user,
        deployHash: req.body.deployHash,
      });
      await RemoveReservesDataModel.create(newData);
      return res.status(200).json({
        success: true,
        message: "User successfully stored for removed liquidity CSPR."
      });
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
  });

module.exports = router;
