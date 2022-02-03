require("dotenv").config();
var express = require("express");
var router = express.Router();
var pair = require("../models/pair");
const Graph = require("node-dijkstra");
const { consoleTestResultHandler } = require("tslint/lib/test");

router.route("/getpath").post(async function (req, res, next) {
  try {
    if (!req.body.tokenASymbol) {
      return res.status(400).json({
        success: false,
        message: "tokenASymbol not found in the request Body.",
      });
    }
    if (!req.body.tokenBSymbol) {
      return res.status(400).json({
        success: false,
        message: "tokenBSymbol not found in the request Body.",
      });
    }

    let pairs = await pair.find({});
    if (pairs.length == 0) {
      return res.status(400).json({
        success: false,
        message: "There is no pair in the database.",
      });
    } else {

      const graph = new Map();

      for (var i = 0; i < pairs.length; i++) {
        let token0 = pairs[i].token0.symbol;
        let token1 = pairs[i].token1.symbol;
        let pairswithtoken0 = [];
        let pairswithtoken1 = [];
        for (var j = 0; j < pairs.length; j++) {
          if (pairs[j].token0.symbol == token0) {
            pairswithtoken0.push(pairs[j].token1.symbol);
          }
          if (pairs[j].token1.symbol == token0) {
            pairswithtoken0.push(pairs[j].token0.symbol);
          }
          if (pairs[j].token0.symbol == token1) {
            pairswithtoken1.push(pairs[j].token1.symbol);
          }
          if (pairs[j].token1.symbol == token1) {
            pairswithtoken1.push(pairs[j].token0.symbol);
          }
        }
        const a = new Map();
        for (var z = 0; z < pairswithtoken0.length; z++) {
          a.set(pairswithtoken0[z], 1);
        }
        graph.set(token0, a);

        const b = new Map();
        for (var z = 0; z < pairswithtoken1.length; z++) {
          b.set(pairswithtoken1[z], 1);
        }
        graph.set(token1, b);
      }
      const route = new Graph(graph);
      console.log("graph: ",graph);
      let path = route.path(req.body.tokenASymbol, req.body.tokenBSymbol);
      if (path != null) {
        let pathwithcontractHash = [];
        for(var i=0;i<path.length;i++)
        {
            for(var j=0;j<pairs.length;j++)
            {
                if(pairs[j].token0.symbol==path[i])
                {
                    pathwithcontractHash.push(pairs[j].token0.id);
                    break;
                }
                if(pairs[j].token1.symbol==path[i])
                {
                    pathwithcontractHash.push(pairs[j].token1.id);
                    break;
                }
            }
        }
        return res.status(200).json({
          success: true,
          message: "Path found against these tokens.",
          path: path,
          pathwithcontractHash: pathwithcontractHash,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Path not found against these tokens.",
          path: path,
        });
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
