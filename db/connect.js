// connect.js

const mongoose = require("mongoose");

const connectDB = (url) => {
    console.log("Attempting to connect to MongoDB...");

    return mongoose.connect(url)
        .then(() => {
            console.log("MongoDB connected successfully!");
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err.message);
        });
};

module.exports = connectDB;
