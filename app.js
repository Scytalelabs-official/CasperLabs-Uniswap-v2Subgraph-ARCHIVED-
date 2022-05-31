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

//routers
var indexRouter = require('./routes/index');
var adminRouter = require("./routes/adminroutes");
var afterDeploymentRouter = require("./routes/afterDeploymentroutes");
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
var setUserForRemoveLiquidityCSPRRouter = require("./routes/setUserForRemoveLiquidityCSPR");

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


app.use("/", adminRouter);
app.use("/", afterDeploymentRouter);

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

app.use('/', indexRouter);
app.use("/", listenerRouter);
app.use("/", tokensListRouter);
app.use("/", deploypairRouter);
app.use("/", pairsListRouter);
app.use("/", swapRouter);
app.use("/", pairRouter);
app.use("/", erc20Router);
app.use("/", coinsmarketcapapiRouter);
app.use("/", pathRouter);
app.use("/", readWasmRouter);
app.use("/", setUserForRemoveLiquidityCSPRRouter);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

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
