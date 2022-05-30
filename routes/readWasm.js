require("dotenv").config();
var express = require("express");
var router = express.Router();
var routerJsClient=require('../JsClients/ROUTER/src/utils')

router.route("/getWasmData").get(async function (req, res, next) {
  try {

    let wasmData= routerJsClient.getWasmDataInBuffer('Scripts/ROUTER/wasm/purse-proxy.wasm');
    console.log(wasmData);
    
    return res.status(200).json({
        success: true,
        message: "Wasm data successfully read and converted. ",
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

router.route("/getWCSPRWasmData").get(async function (req, res, next) {
  try {

    let wasmData= routerJsClient.getWasmDataInBuffer('Scripts/ERC20/wasm/purse-proxy.wasm');
    console.log(wasmData);
    
    return res.status(200).json({
        success: true,
        message: "WCSPR Wasm data successfully read and converted. ",
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
