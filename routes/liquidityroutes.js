require('dotenv').config()
var express = require('express');
const { createFalse } = require('typescript');
var router = express.Router();
var pair = require("../JsClients/PAIR/test/installed.ts");

router.route("/liquidityagainstuserandpair").post(async function (req, res, next) {
    try {

        if (!req.body.to) {
          return res.status(400).json({
            success: false,
            message: "to not found in request body",
          });
        }

        if (!req.body.pairid) {
          return res.status(400).json({
            success: false,
            message: "pairid not found in request body",
          });
        }
        
        let liquidity=await pair.balanceOf(req.body.pairid,req.body.to);
        return res.status(200).json({
            success: true,
            message: "Liquidity has been found against this user against passed pair ",
            liquidity:liquidity
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