require("dotenv").config();
var express = require("express");
var router = express.Router();
var routerJsClient=require('../JsClients/ROUTER/src/utils')
//const v8 = require('v8');
var serialize = require('serialize-javascript');

router.route("/getWasmData").get(async function (req, res, next) {
  try {

    //let wasmData= routerJsClient.getBinary('JsClients/ROUTER/wasm/purse-proxy.wasm');
    let wasmData= routerJsClient.getBinary2('JsClients/ROUTER/wasm/purse-proxy.wasm');
    console.log(wasmData);
    
    return res.status(200).json({
        success: true,
        message: "Wasm data successfully read and converted. ",
        //wasmData: serialize({ arr  : wasmData}),
        wasmData: wasmData,
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
