module.exports = function (req, res, next) {
  var allowedOrigins = [
    "https://casper-swap.herokuapp.com/",
    "http://casper-swap.herokuapp.com/",
    "https://main.d2nr1bes87n0gc.amplifyapp.com/",
    "http://main.d2nr1bes87n0gc.amplifyapp.com/",
  ];
  var origin = req.headers.origin;

  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    console.log("host matched");

    res.setHeader("Cache-Control", "no-cache");
    // res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, GET, DELETE");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Expose-Header", "DAV, content-length, Allow");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Cookies, Set-Cookie"
    );

    // console.log("req.method : " + req.method);

    // res.setHeader("Access-Control-Request-Headers", "*");
    if (req.method == "OPTIONS") {
      return res.status(200).json({});
    }

    next();
  } else {
    //res.setHeader("Access-Control-Allow-Origin", "*");
    console.log("host not matched");
    return res.status(400).json({
      success: false,
      message: "host not matched!",
    });
  }
};
