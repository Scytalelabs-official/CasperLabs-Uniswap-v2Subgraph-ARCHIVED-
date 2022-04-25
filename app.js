var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");
var listenerRouter = require("./routes/listenerroutes");
var tokensListRouter = require("./routes/tokenslist");
var pairsListRouter = require("./routes/pairslist");
var deploypairRouter = require("./routes/deploypair");
var swapRouter = require("./routes/swaproutes");
var pairRouter = require("./routes/pairroutes");
var erc20Router = require("./routes/erc20routes");
var coinsmarketcapapiRouter = require("./routes/coinsmarketcapapi");
var pathRouter = require("./routes/pathroutes");
var readWasmRouter = require("./routes/readWasm");
var event_Id_Data_Model = require("./models/eventsIdData");
var eventId = require("./models/eventId");
const axios = require('axios').default;
const consumer = require('./consumer');

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

var DB_URL;

if (process.env.NODE_MODE == "deployed") {
  DB_URL = process.env.DATABASE_URL_ONLINE;
} else {
  DB_URL = process.env.DATABASE_URL_LOCAL;
}

console.log("DB_URL : " + DB_URL);

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false,
};
const connect = mongoose.connect(DB_URL, connectionParams);
// connecting to the database
connect.then(
  (db) => {
    console.log("Connected to the MongoDB server\n\n");
  },
  (err) => {
    console.log(err);
  }
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.get("/", (req, res) => {
  res.json({ msg: "Uniswap V2 GraphQL Server" });
});
app.use("/", listenerRouter.router);
app.use("/", tokensListRouter);
app.use("/", deploypairRouter);
app.use("/", pairsListRouter);
app.use("/", swapRouter);
app.use("/", pairRouter);
app.use("/", erc20Router);
app.use("/", coinsmarketcapapiRouter);
app.use("/", pathRouter);
app.use("/", readWasmRouter);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

let _eventId;
let count;
async function Count(){
  _eventId= await eventId.findOne({id: '0'});
  count = BigInt(_eventId.completedEventId);
  console.log("Count : ", count);
}
Count();
console.log("Count : ", count);
let missingCount=0;
consumer.consumeEvent();

setInterval(async()=>{ 
    //code goes here that will be run every 2 seconds. 
    console.log("Heap Length : ", listenerRouter.isNewEvent());

    if(listenerRouter.isNewEvent()>0){
      console.log("Current Event Id : ", BigInt(listenerRouter.heapRoot().eventId));
      console.log("Current Count : ", count);
      if(missingCount>=5){
        let temp = count + BigInt(1);
        await axios.post('http://localhost:3001/listener/getMissingEvent',{
          eventId : temp.toString()
        })
        .then(async function(response){
          missingCount=0;
          // console.log("Response : ",response);
        })
        .catch(function(error){
          console.log("Missing Event Error : ", error);
        });
      }
      if(BigInt(listenerRouter.heapRoot().eventId) - count === BigInt(1)){
        //heap.extractroot
        missingCount=0;
        const currentEvent = listenerRouter.depopulateHeap();
        console.log("Current Event : ", currentEvent);

        //call mutation
        let result = await listenerRouter.geteventsdata(currentEvent.deployHash, currentEvent.timestamp, currentEvent.block_hash, currentEvent.eventName, currentEvent.eventsdata);
        console.log("Result : ",result) 
        let _updateEvent = await event_Id_Data_Model.findOne({eventId: currentEvent.eventId});
        await _updateEvent.updateOne({"status":"Completed"});
        count++;
        console.log("Completed Event Count : ", count);

        if(_eventId.eventId < currentEvent.eventId){
         await eventId.updateOne({"eventId":currentEvent.eventId.toString()});
        }
        await eventId.updateOne({"completedEventId":count.toString()});        
      }
    else{
      missingCount++;
    }
  }
}, 2000);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});





// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
