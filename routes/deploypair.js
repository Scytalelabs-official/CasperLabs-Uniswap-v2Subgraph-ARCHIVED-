require("dotenv").config();
var express = require("express");
var router = express.Router();
var pair = require("../JsClients/PAIR/test/install.ts");
var pairsagainstuser = require("../models/pairsagainstuser");
var pairsModel = require("../models/pair");

router.route("/makedeploypaircontract").post(async function (req, res, next) {
  try {
    if (!req.body.signerKey) {
      return res.status(400).json({
        success: false,
        message: "signerKey not found in request body",
      });
    }

    var deployJSON = await pair.makedeploypaircontract(
      process.env.FACTORY_CONTRACT,
      process.env.CALLEE_CONTRACT,
      req.body.signerKey
    );
    console.log("deployJSON: ", deployJSON);

    if (deployJSON != null) {
      return res.status(200).json({
        success: true,
        message: "Pair contract make deploy SuccessFull.",
        deployJSON: deployJSON,
      });
    } else {
      return res.status(400).json({
        success: true,
        message: "Pair contract make deploy Failed.",
        deploy_status: "False",
      });
    }
  } catch (error) {
    console.log("error (try-catch) : " + error);
    return res.status(500).json({
      success: false,
      err: error,
    });
  }
});

router
  .route("/saveuseragainstpaircontract")
  .post(async function (req, res, next) {
    try {
      if (!req.body.user) {
        return res.status(400).json({
          success: false,
          message: "user not found in request body",
        });
      }
      if (!req.body.pairContractHash) {
        return res.status(400).json({
          success: false,
          message: "pairContractHash not found in request body",
        });
      }

      let newData = new pairsagainstuser({
        pairContractHash: req.body.pairContractHash.toLowerCase(),
        user: req.body.user.toLowerCase(),
      });
      await pairsagainstuser.create(newData);

      return res.status(200).json({
        success: true,
        message: "Pair contract saving against user is SuccessFull.",
      });
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
  });

router.route("/getpairsagainstuser").post(async function (req, res, next) {
  try {
    if (!req.body.user) {
      return res.status(400).json({
        success: false,
        message: "user not found in request body",
      });
    }

    let result = await pairsagainstuser.find({
      user: req.body.user.toLowerCase(),
    });
    if (result.length == 0) {
      return res.status(400).json({
        success: false,
        message: "There is no pair against this user.",
      });
    } else {
      let pairs = [];
      for (var i = 0; i < result.length; i++) {
        let pair = await pairsModel.findOne({ id: result[i].pairContractHash });
        if (pair != null) {
          pairs.push(pair);
        }

        if (i == result.length - 1) {
          if (pairs.length == 0) {
            return res.status(400).json({
              success: false,
              message: "There is no pair against this user.",
            });
          }
          return res.status(200).json({
            success: true,
            message: "Pairs against user is SuccessFull.",
            userpairs: pairs,
          });
        }
      }
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
