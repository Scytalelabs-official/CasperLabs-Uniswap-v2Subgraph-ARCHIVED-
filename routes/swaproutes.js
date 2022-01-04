require('dotenv').config()
var express = require('express');
var router = express.Router();
var routercontract = require("../JsClients/ROUTER/test/installed.ts");

router.route("/swapmakedeployJSON").post(async function (req, res, next) {
    try {

        if(!req.body.signerKey)
		{
			return res.status(400).json({
				success: false,
				message: "signerKey not found in the body.",
			});
		}

		if(!req.body.amountin)
		{
			return res.status(400).json({
				success: false,
				message: "amountin not found in the body.",
			});
		}
		if(!req.body.amountout)
		{
			return res.status(400).json({
				success: false,
				message: "amountout not found in the body.",
			});
		}
        if(!req.body.paths)
		{
			return res.status(400).json({
				success: false,
				message: "paths not found in the body.",
			});
		}
        if(!req.body.to)
		{
			return res.status(400).json({
				success: false,
				message: "to not found in the body.",
			});
		}
        if(!req.body.deadline)
		{
			return res.status(400).json({
				success: false,
				message: "deadline not found in the body.",
			});
		}
      
        
        console.log("key",req.body.signerKey);
        var deployJSON = await routercontract.swapforinterface(
			req.body.signerKey,
            req.body.amountin,
            req.body.amountout,
            req.body.paths,
            req.body.to,
            req.body.deadline,
            "200000000000"
		);
		console.log("deployJSON: ", deployJSON);
		
		if(deployJSON!=null)
		{
			return res.status(200).json({
				success: true,
				message: "Router contract Swap make deploy SuccessFull.",
				deployJSON:deployJSON
			});
		}
		else{
			return res.status(400).json({
				success: false,
				message: "Router contract Swap make deploy Failed.",
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