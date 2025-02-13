const mongoose = require("mongoose");

const toIST = (date) => {
    const IST = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() + IST);
};

const userSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    name: {
        type: String,
        required: [true, "Enter Name"],
    },
    email: {
        type: String,
        required: [true, "Enter Email"],
        unique: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email address']
    },
    time: {
        type: String,
        default: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    },
    viewedBy: {
        type: [String],
    },
    viewed: {
        type: [String],
    }
},
    {
        timestamps: true
    });


userSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdAt = toIST(this.createdAt);
        this.time = toIST(this.time);
    }
    this.updatedAt = toIST(new Date());
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;