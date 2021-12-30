require('dotenv').config()
var express = require('express');
var router = express.Router();
var pairModel=require('../models/pair');
var hashesofpairsModel=require('../models/hashesofpairs');

router.route("/getpairagainsttokens").post(async function (req, res, next) {
    try {

		if(!req.body.token0)
		{
			return res.status(400).json({
				success: false,
				message: "token0 not found in the body.",
			});
		}
		if(!req.body.token1)
		{
			return res.status(400).json({
				success: false,
				message: "token1 not found in the body.",
			});
		}

		var pairresult= await pairModel.find({});
		if(pairresult.length==0)
		{
			return res.status(400).json({
				success: false,
				message: "There is no pair in the database.",
			});
		}
		else
		{
			let paircontractHash=null;
			for(var i=0;i<pairresult.length;i++)
			{
				if(pairresult[i].token0.id == req.body.token0 && pairresult[i].token1.id == req.body.token1)
				{
					paircontractHash=pairresult[i].id;
				}
				if(i==pairresult.length-1)
				{
					if(paircontractHash==null)
					{
						return res.status(400).json({
							success: false,
							message: "There is no pair against this token0 and token1.",
						});
					}
				}
			}
			if(paircontractHash!=null)
			{
				var pairsresult2=await hashesofpairsModel.find({});
				if(pairsresult2.length==0)
				{
					console.log("there are no contract and package hash found in the database.");
					return res.status(400).json({
						success: false,
						message: "there are no contract and package hash found in the database."
					});
				}
				var pairpackageHash=null;
				for(var i=0;i<pairsresult2.length;i++)
				{
					if((pairsresult2[i].contractHash).toLowerCase()==paircontractHash.toLowerCase())
					{
						pairpackageHash=pairsresult2[i].packageHash;
						return res.status(200).json({
							success: true,
							message: "Pair has been found on this token0 and token1.",
							contractHash:paircontractHash,
							packageHash:pairpackageHash
						});
					}
					if(i==pairsresult2.length-1)
					{
						if(pairpackageHash==null)
						{
							return res.status(400).json({
								success: false,
								message: "There is no pair against this contract Hash in the hashesofpairs collection.",
							});
						}
					}
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

router.route("/getpairlist").get(async function (req, res, next) {
    try {

		var pairresult= await pairModel.find({});
		if(pairresult.length==0)
		{
			return res.status(400).json({
				success: false,
				message: "There is no pair in the database.",
			});
		}
		else
		{
			return res.status(200).json({
				success: true,
				message: "Pair List: ",
				pairList:pairresult
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

module.exports = router;