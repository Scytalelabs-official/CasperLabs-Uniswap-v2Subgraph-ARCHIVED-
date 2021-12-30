require('dotenv').config()
var express = require('express');
var router = express.Router();
var pair = require("../JsClients/PAIR/test/install.ts");

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
		
		if(deployJSON!=null)
		{
			return res.status(200).json({
				success: true,
				message: "Pair contract make deploy SuccessFull.",
				deployJSON:deployJSON
			});
		}
		else{
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


module.exports = router;