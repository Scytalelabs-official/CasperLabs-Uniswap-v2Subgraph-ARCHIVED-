require('dotenv').config()
var express = require('express');
var router = express.Router();
var mintModel=require('../models/mint');

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
        var mintresult= await mintModel.find({to:req.body.to});

        if(mintresult.length==0)
        {
          return res.status(400).json({
            success: false,
            message: "There is no liquidity found in the database against this user.",
          });
        }
        else
        {
                let liquidity=0;
                for(var i=0;i<mintresult.length;i++)
                {
                    if(req.body.pairid==mintresult[i].pair.id)
                    {
                        liquidity=liquidity+mintresult[i].liquidity;
                    }
                    if(i== (mintresult.length-1))
                    {
                        return res.status(200).json({
                            success: true,
                            message: "Liquidity has been found against this user against passed pair ",
                            liquidity:liquidity
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