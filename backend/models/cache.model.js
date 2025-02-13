const mongoose = require("mongoose");

const cacheSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    data: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now, expires: 604800 }
});

const Cache = mongoose.model("Cache", cacheSchema);