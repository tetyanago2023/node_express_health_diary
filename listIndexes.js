// listIndexes.js

require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
    try {
        // Connect to your MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const db = mongoose.connection;
        const indexes = await db.collection('users').indexes();

        console.log('Existing Indexes:', indexes);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error inspecting indexes:', error);
    }
})();
