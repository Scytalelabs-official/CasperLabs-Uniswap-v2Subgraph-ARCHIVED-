const jwt = require("../utils/jwt");
const passport = require("passport");

require("dotenv").config();

var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

module.exports.verifyToken = async function (req, res, next) {

  let token = req.get("Authorization");

  if (!token) {
    return res.status(401).send("You are not logged-in (token not found) !!");
  }

  if (token.includes("Bearer")) token = token.slice(7);

  let result = await jwt.verify(token);

  if (!result) {
    return res.status(401).send("Unauthorized access (invalid token) !!");
  }

  next();
};

var cookieExtractor = function (req) {
  var token = req.get("Authorization");
  if (token.includes("Bearer")) token = token.slice(7);
  return token;

};

var opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.TOKEN_KEY;
opts.ignoreExpiration = true;
opts.ignoreNotBefore = true;

passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {

    var user = {
      username: jwt_payload.username
    };
    return done(null, user);

  })
);