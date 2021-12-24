require('dotenv').config()
var express = require('express');
var router = express.Router();
const rp = require('request-promise');
const { resolveProjectReferencePath } = require('typescript');

router.route("/getworthinUSD").post(async function (req, res, next) {
    try {

        if(!req.body.symbol)
        {
            return res.status(400).json({
                success: false,
                message: "symbol not found in the request body."
            });
        }
        if(!req.body.amount)
        {
            return res.status(400).json({
                success: false,
                message: "amount not found in the request body."
            });
        }
        if(!req.body.start)
        {
            return res.status(400).json({
                success: false,
                message: "start not found in the request body."
            });
        }
        if(!req.body.end)
        {
            return res.status(400).json({
                success: false,
                message: "end not found in the request body."
            });
        }
        const requestOptions = {
            method: 'GET',
            url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
            qs: {
                'start': req.body.start,
                'limit': req.body.end,
                'convert': 'USD'
            },
            headers: {
                'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_KEY
            },
            json: true,
            gzip: true
        };

        rp(requestOptions)
        .then(response => {

            for(var i=0; i<response.data.length;i++)
            {
                console.log("symbol: ",response.data[i].symbol);
                if(response.data[i].symbol == req.body.symbol)
                {
                    return res.status(200).json({
                        success: true,
                        message:  req.body.symbol+" worth in USD is = "+response.data[i].quote.USD.price,
                        worth:response.data[i].quote.USD.price,
                        worthforamountpassed:req.body.amount*(response.data[i].quote.USD.price)
                    });
                }
              
                if(i==(response.data.length)-1)
                {
                    console.log(req.body.symbol+" not found in the coinmarketcap Api cryptocurrencies");
                    return res.status(400).json({
                        success: true,
                        message:  req.body.symbol+" not found in the coinmarketcap Api cryptocurrencies",
                    });
                }
            }
            
        }).catch((err) => {

            console.log('API call error:', err.message);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        });

    
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
});

router.route("/tokensworthconversion").post(async function (req, res, next) {
    try {

        if(!req.body.symbolforconversion)
        {
            return res.status(400).json({
                success: false,
                message: "symbolforconversion not found in the request body."
            });
        }
        if(!req.body.symboltoconvertto)
        {
            return res.status(400).json({
                success: false,
                message: "symboltoconvertto not found in the request body."
            });
        }
        if(!req.body.amounttoconvertto)
        {
            return res.status(400).json({
                success: false,
                message: "amount not found in the request body."
            });
        }
        if(!req.body.start)
        {
            return res.status(400).json({
                success: false,
                message: "start not found in the request body."
            });
        }
        if(!req.body.end)
        {
            return res.status(400).json({
                success: false,
                message: "end not found in the request body."
            });
        }
        const requestOptions = {
            method: 'GET',
            url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
            qs: {
                'start': req.body.start,
                'limit': req.body.end,
                'convert': 'USD'
            },
            headers: {
                'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_KEY
            },
            json: true,
            gzip: true
        };

        let symboltoconverttoworthinUSD;
        let symbolforconvertionworthinUSD;
        let count=0;
        let flag=0;
    
        rp(requestOptions)
        .then(response => {

            //console.log('API call response: ', response.data);
            for(var i=0; i<response.data.length;i++)
            {
                console.log("symbol: ",response.data[i].symbol);
                if(response.data[i].symbol == req.body.symbolforconversion)
                {
                    symbolforconvertionworthinUSD=response.data[i].quote.USD.price;
                    console.log("symbolforconverion worth in USD: ",symbolforconvertionworthinUSD);
                    count++;
                    flag=1;
                }
                if(response.data[i].symbol == req.body.symboltoconvertto)
                {
                    symboltoconverttoworthinUSD=response.data[i].quote.USD.price;
                    console.log("symboltoconverttoworthinUSD worth in USD: ",symboltoconverttoworthinUSD);
                    count++;
                    flag=2;
                }
                if(count==2)
                {
                    
                    return res.status(200).json({
                        success: true,
                        symbolforconversionWorthInUSD:req.body.symbolforconversion+" worth in USD = "+symbolforconvertionworthinUSD,
                        symboltoconverttoWorthInUSD:req.body.symboltoconvertto+" worth in USD = "+symboltoconverttoworthinUSD,
                        ratio: "1 "+ req.body.symboltoconvertto+ " = "+ symboltoconverttoworthinUSD/symbolforconvertionworthinUSD+" "+req.body.symbolforconversion +" ($"+symboltoconverttoworthinUSD+")",
                        worth: symbolforconvertionworthinUSD/symboltoconverttoworthinUSD,
                        worthforamountpassed:(symbolforconvertionworthinUSD/symboltoconverttoworthinUSD)*req.body.amounttoconvertto
                         
                    });
                }
                if(i==(response.data.length)-1)
                {
                    if(flag==1)
                    {
                        console.log(req.body.symboltoconvertto+" not found in the coinmarketcap Api cryptocurrencies");
                        return res.status(400).json({
                            success: true,
                            message:  req.body.symboltoconvertto+" not found in the coinmarketcap Api cryptocurrencies",
                        });
                    }
                    else if(flag==2)
                    {
                        console.log(req.body.symbolforconversion+" not found in the coinmarketcap Api cryptocurrencies");
                        return res.status(400).json({
                            success: true,
                            message:  req.body.symbolforconversion+ " not found in the coinmarketcap Api cryptocurrencies",
                        });
                        
                    }
                    
                }
            }
            
        }).catch((err) => {

            console.log('API call error:', err.message);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        });

    
    } catch (error) {
      console.log("error (try-catch) : " + error);
      return res.status(500).json({
        success: false,
        err: error,
      });
    }
});

router.route("/priceconversion").post(async function (req, res, next) {
    try {

        if(!req.body.symbolforconversion)
        {
            return res.status(400).json({
                success: false,
                message: "symbolforconversion not found in the request body."
            });
        }
        if(!req.body.symboltoconvertto)
        {
            return res.status(400).json({
                success: false,
                message: "symboltoconvertto not found in the request body."
            });
        }
        if(!req.body.amount)
        {
            return res.status(400).json({
                success: false,
                message: "amount not found in the request body."
            });
        }
        const requestOptions = {
            method: 'GET',
            uri: "https://pro-api.coinmarketcap.com/v1/tools/price-conversion",
            qs: {
                'amount':req.body.amount,
                'symbol':req.body.symbolforconversion,
                'convert': req.body.symboltoconvertto
            },
            headers: {
                'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_KEY
            },
            json: true,
            gzip: true
        };
    
        rp(requestOptions)
        .then(response => {

            console.log('API call response: ', response.data);
            return res.status(400).json({
                success: false,
                worth: response.data.quote
            });
            
        }).catch((err) => {

            console.log('API call error:', err.message);
            return res.status(400).json({
                success: false,
                message: err.message
            });
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
