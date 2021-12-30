require('dotenv').config()
var express = require('express');
var router = express.Router();
var tokensListModel=require('../models/tokensList');

router.route("/addtokensList").post(async function (req, res, next) {
    try {

		if(!req.body.tokensList)
		{
			return res.status(400).json({
				success: false,
				message: "tokensList not found in the request Body.",
			});
		}
		let newData= new tokensListModel({
			data:req.body.tokensList
		});
		await tokensListModel.create(newData);
		
		return res.status(200).json({
			success: true,
			message: "Token List Data SuccessFully Saved."
		});
    
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
});

router.route("/tokensList").get(async function (req, res, next) {
    try {

		var tokensList= await tokensListModel.findOne({});
		if(tokensList==null)
		{
			return res.status(400).json({
				success: false,
				message: "There is no data in tokensList Collection.",
			});
		}
		else{
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
