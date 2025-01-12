// syncIndexes.js

const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path to User model

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await User.syncIndexes();
        console.log('Indexes synced successfully.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error syncing indexes:', error);
    }
})();
