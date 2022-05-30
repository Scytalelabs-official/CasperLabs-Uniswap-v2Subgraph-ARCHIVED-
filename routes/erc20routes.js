require("dotenv").config();
var express = require("express");
var router = express.Router();
var erc20 = require("../JsClients/ERC20/scripts/installed.ts");

router.route("/balanceagainstuser").post(async function (req, res, next) {
  try {
    if (!req.body.contractHash) {
      return res.status(400).json({
        success: false,
        message: "contractHash not found in request body",
      });
    }

    if (!req.body.user) {
      return res.status(400).json({
        success: false,
        message: "user not found in request body",
      });
    }

    let balance = await erc20.balanceOf(req.body.contractHash, req.body.user);
    return res.status(200).json({
      success: true,
      message: "Balance has been found against this user against passed token ",
      balance: balance,
    });
  } catch (error) {
    console.log("error (try-catch) : " + error);
    return res.status(500).json({
      success: false,
      err: error,
    });
  }
});

router
  .route("/allowanceagainstownerandspender")
  .post(async function (req, res, next) {
    try {
      if (!req.body.contractHash) {
        return res.status(400).json({
          success: false,
          message: "contractHash not found in request body",
        });
      }

      if (!req.body.owner) {
        return res.status(400).json({
          success: false,
          message: "owner not found in request body",
        });
      }

      if (!req.body.spender) {
        return res.status(400).json({
          success: false,
          message: "spender not found in request body",
        });
      }

      let allowance = await erc20.allowance(
        req.body.contractHash,
        req.body.owner,
        req.body.spender
      );
      console.log("Allowance: ", allowance);

      return res.status(200).json({
        success: true,
        message: "Allowance has been found against this owner and spender",
        allowance: allowance,
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
