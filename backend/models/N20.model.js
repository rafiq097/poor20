const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    ID: {
        type: String,
        required: true,
        unique: true
    },
    NAME: {
        type: String
    },
    GENDER: {
        type: String
    },
    DOB: {
        type: String,
    },
    RANK: {
        type: Number,
    },
    CASTE: {
        type: String
    },
    PHONE: {
        type: Number
    },
    EMAIL: {
        type: String
    },
    FATHER: {
        type: String
    },
    FATHER_PHONE: {
        type: Number
    },
    ADDRESS: {
        type: String
    },
    DOOR_NO: {
        type: String
    },
    MANDAL: {
        type: String
    },
    TOWN: {
        type: String
    },
    DISTRICT: {
        type: String
    },
    PINCODE: {
        type: String
    },
    AADHAAR: {
        type: Number
    },
    BRANCH: {
        type: String
    }
});

const N20 = mongoose.model("N20", dataSchema, "N20");

module.exports = N20;
