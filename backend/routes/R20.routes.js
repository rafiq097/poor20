const express = require("express");
const router = express.Router();

const { getAllData, getSingleData } = require("../controllers/R20.controller.js");

// router.get("/", getAllUsers);
router.route("/").get(getAllData);
// router.get("/:username", getSingleUser);
router.route("/:username").get(getSingleData);

module.exports = router;