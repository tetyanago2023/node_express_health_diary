// dropIndex.js

require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        const db = mongoose.connection;

        // Drop the problematic index
        await db.collection('users').dropIndex('username_1');
        console.log('Dropped index: username_1');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error dropping index:', error);
    }
})();
