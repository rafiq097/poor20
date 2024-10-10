const express = require("express");
const router = express.Router();

const { loginUser, getAllUsers } = require("../controllers/user.controller.js");

// router.get("/", getAllUsers);
router.route("/login").post(loginUser);

module.exports = router;