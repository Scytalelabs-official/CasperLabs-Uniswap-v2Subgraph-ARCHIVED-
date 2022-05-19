const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.sign = async function (payload) {
  let signOptions = {
    expiresIn: parseInt(process.env.TOKEN_EXPIRY_TIME)
  };
  return await jwt.sign(payload, process.env.TOKEN_KEY, signOptions );

};

exports.verify = async function (token) {
  try {
  
    return await jwt.verify(token, process.env.TOKEN_KEY);
  } catch (error) {
    return;
  }
};