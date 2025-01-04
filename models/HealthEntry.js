// models/HealthEntry.js

const mongoose = require('mongoose');

// Define the schema for a health entry
const healthEntrySchema = new mongoose.Schema({
    date: { type: Date, required: true },  // Ensure it's a Date type
    bloodSugarLevel: { type: String },
    medicationsTaken: { type: String },
    physicalActivityLog: { type: String },
    mealLog: { type: String },
    notes: { type: String }
});


// Create the model from the schema
const HealthEntry = mongoose.model('HealthEntry', healthEntrySchema);

// Export the model
module.exports = HealthEntry;
