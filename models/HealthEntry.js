// model/HealthEntry.js

const mongoose = require('mongoose');

// Define the HealthEntry schema
const healthEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now // Default to the current date if not provided
    },
    bloodSugarLevel: {
        type: Number,
        required: true
    },
    medicationsTaken: {
        type: [String], // Array of strings for medication names
        default: []
    },
    physicalActivityLog: [{
        activity: {
            type: String, // Activity type (e.g., running, cycling)
            required: true
        },
        duration: {
            type: Number, // Duration in minutes
            required: true
        }
    }],
    mealLog: [{
        foodName: {
            type: String,
            required: true
        },
        carbs: {
            type: Number,
            required: true
        }
    }],
    notes: {
        type: String,
        default: ''
    }
});

// Create the HealthEntry model
const HealthEntry = mongoose.model('HealthEntry', healthEntrySchema);

module.exports = HealthEntry;
