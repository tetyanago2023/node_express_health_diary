// routes/healthEntry.js

const express = require("express");
const router = express.Router();

const {
    getAllHealthEntries,
    showHealthEntry,
    showHealthEntryForm,
    createHealthEntry,
    updateHealthEntry,
    deleteHealthEntry,
} = require("../controllers/healthEntry");

// List of health entries and create new entry
router.route("/")
    .get(getAllHealthEntries) // Render health entries list with pagination and filtering
    .post(createHealthEntry); // Create a new health entry

// Form handler for adding or editing a health entry
router.get("/form/:id?", showHealthEntryForm);

// Show a specific health entry
router.get("/:id", showHealthEntry);

// Update a health entry
router.post("/update/:id", updateHealthEntry);

// Delete a health entry
router.post("/delete/:id", deleteHealthEntry);

module.exports = router;
