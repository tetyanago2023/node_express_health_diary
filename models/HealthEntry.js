// models/HealthEntry.js

const mongoose = require('mongoose');

// Define the schema for a health entry
const healthEntrySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    bloodSugarLevel: { type: Number, required: true },
    medicationsTaken: { type: String },
    physicalActivityLog: { type: String },
    mealLog: { type: String },
    fastingGlucoseLevel: { type: Boolean, required: true, default: false }, // Changed from notes to fastingGlucoseLevel
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Add userId here
});

// Create the model from the schema
const HealthEntry = mongoose.model('HealthEntry', healthEntrySchema);

// Export the model
module.exports = HealthEntry;
