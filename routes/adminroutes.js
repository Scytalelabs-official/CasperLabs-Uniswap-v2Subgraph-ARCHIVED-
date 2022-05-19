var express = require("express");
var router = express.Router();
require("dotenv").config();
const AdminModel = require("../models/adminModel");
const bcrypt = require("bcrypt");
const { BCRYPT_SALT_ROUNDS } = require("../config/bcrypt");
const jwtUtil = require("../utils/jwt");

// router.post("/adminsignup", async function (req, res, next) {
//   try {

//     if (!req.body.username) {
//       return res.status(400).json({
//         success: false,
//         message: "username not found in the request body!",
//       });
//     }
//     if (!req.body.password) {
//         return res.status(400).json({
//         success: false,
//         message: "Password not found in the request body!",
//         });
//     }

//     var usernamecheck = await AdminModel.findOne({ username: req.body.username });
//     if (usernamecheck) {
//       return res.status(400).json({
//         success: false,
//         message: "This Admin already exists.",
//       });
//     }

//     if (req.body.password.length < 4) {
//       return res.status(400).json({
//         success: false,
//         message: "Password length must be greater than 4!",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(
//       req.body.password,
//       BCRYPT_SALT_ROUNDS
//     );

//     req.body.password = hashedPassword;

//     var newadmin = new AdminModel({
//         username: req.body.username,
//         password: req.body.password
//     });

//     await AdminModel.create(newadmin);
//     console.log("new admin created");

//     return res.status(200).json({
//       success: true,
//       message: "Admin Successfully Signed-up",
//     });

//   } catch (error) {
//     console.log("error (try-catch) : " + error);
//     return res.status(500).json({
//       success: false,
//       err: error,
//     });
//   }
  
// });

router.post("/adminlogin", async function (req, res, next) {
  try {

    if (!req.body.username) {
      return res.status(400).json({
        success: false,
        message: "Username not found in the request body!",
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Password not found in the request body!",
      });
    }

    var admin = await AdminModel.findOne({
        username: req.body.username,
    });
    console.log("admin : ", admin);

    if (!admin) {
      return res.status(404).json({
        success: true,
        message: "Admin don't exist against this username",
      });
    }

    const validPassword = bcrypt.compareSync(req.body.password, admin.password); // user password is stored as hashed
    if (!validPassword) {
      return res.status(403).json("Incorrect password entered");
    }

    let payload;
    payload = {
      username: req.body.username,
      adminId: admin._id,
    };

    let token = await jwtUtil.sign(payload);

    return res.status(200).json({
      success: true,
      message: "Admin Successfully logged-in",
      token: token,
      AdminId: admin._id,
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