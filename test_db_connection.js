// test_db_connection.js

const connectDB = require('./db/connect');
require('dotenv').config();

connectDB(process.env.MONGO_URI_TEST)
    .then(() => {
        console.log('MongoDB connected successfully!');
    })
    .catch((err) => {
        console.log('Error connecting to MongoDB:', err.message);
    });
