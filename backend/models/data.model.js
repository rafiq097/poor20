const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    ID: {
        type: String,
        required: true,
        unique: true
    },
    Name: {
        type: String
    },
    Gender: {
        type: String
    },
    DOB: {
        type: String,
    },
    Caste: {
        type: String
    },
    Phone: {
        type: Number
    },
    email: {
        type: String
    },
    Father: {
        type: String
    },
    Father_Phone: {
        type: Number
    },
    Address: {
        type: String
    },
    Door_No: {
        type: String
    },
    Mandal: {
        type: String
    },
    Town: {
        type: String
    },
    District: {
        type: String
    },
    Pincode: {
        type: String
    },
    Aadhaar: {
        type: Number
    },
    Branch: {
        type: String
    }
});

const Data = mongoose.model("Data", dataSchema, "N20");

module.exports = Data;
