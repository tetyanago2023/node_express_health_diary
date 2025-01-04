// controller/healthEntry.js

const HealthEntry = require("../models/HealthEntry");

const getAllHealthEntries = async (req, res) => {
    try {
        const { date, bloodSugarLevel, physicalActivity, mealLog, notes, medicationsTaken, page = 1, limit = 10 } = req.query;

        const filters = {};

        // Add date filter (exact match or range if needed)
        if (date) {
            filters.date = new Date(date); // Parse the date input correctly
        }

        // Add blood sugar level filter (exact match or range)
        if (bloodSugarLevel) {
            filters.bloodSugarLevel = Number(bloodSugarLevel); // Ensure it's a number
        }

        // Add physical activity filter (case-insensitive search)
        if (physicalActivity) {
            filters.physicalActivityLog = { $regex: physicalActivity, $options: 'i' }; // Updated to match plain string
        }

        // Add meal log filter (case-insensitive search)
        if (mealLog) {
            filters.mealLog = { $regex: mealLog, $options: 'i' }; // Updated to match plain string
        }

        // Add notes filter (case-insensitive search)
        if (notes) {
            filters.notes = { $regex: notes, $options: 'i' };
        }

        // Add medications filter (case-insensitive search)
        if (medicationsTaken) {
            filters['medications.name'] = { $regex: medicationsTaken, $options: 'i' };
        }

        // Pagination settings
        const skip = (page - 1) * limit;

        // Query the database
        const healthEntries = await HealthEntry.find(filters)
            .skip(skip)
            .limit(Number(limit));

        // Count total documents for pagination
        const totalEntries = await HealthEntry.countDocuments(filters);

        res.render('healthEntries', {
            healthEntries,
            currentPage: Number(page),
            totalPages: Math.ceil(totalEntries / limit),
            limit: Number(limit),
            hasPrevPage: page > 1,
            hasNextPage: page * limit < totalEntries,
            dateFilter: date || '',
            bloodSugarFilter: bloodSugarLevel || '',
            activityFilter: physicalActivity || '',
            mealLogFilter: mealLog || '',  // Pass mealLogFilter to the view
            notesFilter: notes || '',      // Pass notesFilter to the view
            medicationsFilter: medicationsTaken || '', // Pass medicationsFilter to the view
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred while fetching health entries.');
        res.status(500).send('An error occurred while fetching health entries.');
    }
};

const showHealthEntry = async (req, res, next) => {
    try {
        const healthEntry = await HealthEntry.findOne({ _id: req.params.id, userId: req.user.id });
        if (!healthEntry) {
            req.flash("error", "Health entry not found1.");
            return res.redirect("/healthEntries");
        }
        res.render("showHealthEntry", { healthEntry, _csrf: res.locals._csrf });
    } catch (error) {
        next(error);
    }
};

const showHealthEntryForm = async (req, res, next) => {
    try {
        // Log incoming request and params
        console.log("Request Params - entry id:", req.params); // Log the parameters, especially the 'id'
        console.log("Request User:", req.user); // Log the user to ensure it's available

        if (req.params.id) {
            console.log("Fetching health entry for ID:", req.params.id); // Log ID being used for fetching

            const healthEntry = await HealthEntry.findOne({ _id: req.params.id, userId: req.user.id });
            console.log("Fetched healthEntry:", healthEntry); // Log the fetched health entry

            if (!healthEntry) {
                req.flash("error", "Health entry not found2.");
                console.log("Health entry not found for ID:", req.params.id);
                return res.redirect("/healthEntries");
            }

            // Pass the healthEntry to the view for editing
            console.log("Rendering health entry form with editing mode");
            return res.render("healthEntry", { healthEntry, _csrf: res.locals._csrf });
        }

        // If no 'id' is present, render form for a new health entry
        console.log("Rendering health entry form for new entry");
        res.render("healthEntry", { healthEntry: null, _csrf: res.locals._csrf });
    } catch (error) {
        console.error("Error in showHealthEntryForm:", error); // Log any errors
        req.flash("error", "An unexpected error occurred.");
        return next(error);
    }
};


const createHealthEntry = async (req, res, next) => {
    try {
        console.log("Request body:", req.body); // Log the request body for debugging

        const { date, bloodSugarLevel, medicationsTaken, physicalActivityLog, mealLog, notes } = req.body;

        // Check if the date is provided and parse it
        if (!date) {
            req.flash("error", "Date is required.");
            return res.redirect("/healthEntries/form"); // Redirect back to the form if date is missing
        }

        const healthEntry = new HealthEntry({
            userId: req.user.id,  // Ensure req.user.id exists
            date: new Date(date), // Parse the date string into a Date object
            bloodSugarLevel,
            medicationsTaken,
            physicalActivityLog,
            mealLog,
            notes,
        });

        // Save the health entry to the database
        await healthEntry.save();

        res.redirect("/healthEntries"); // Redirect to the health entries list page
    } catch (error) {
        console.error("Error creating health entry:", error); // Log the error for debugging
        req.flash("error", "An error occurred while creating the health entry.");
        res.redirect("/healthEntries/form"); // Redirect back to the form if there's an error
    }
};


const updateHealthEntry = async (req, res, next) => {
    try {
        const { bloodSugarLevel, medicationsTaken, physicalActivityLog, mealLog, notes } = req.body;
        const healthEntry = await HealthEntry.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { bloodSugarLevel, medicationsTaken, physicalActivityLog, mealLog, notes },
            { new: true, runValidators: true }
        );
        if (!healthEntry) {
            req.flash("error", "Health entry not found3.");
            return res.redirect("/healthEntries");
        }
        res.redirect("/healthEntries");
    } catch (error) {
        next(error);
    }
};

const deleteHealthEntry = async (req, res, next) => {
    try {
        const healthEntry = await HealthEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!healthEntry) {
            req.flash("error", "Health entry not found4.");
        }

        // Preserve filters and pagination in redirect URL
        const { page, limit, date } = req.query;
        const redirectUrl = `/healthEntries?page=${encodeURIComponent(page || 1)}&limit=${encodeURIComponent(limit || 10)}&date=${encodeURIComponent(date || '')}`;
        res.redirect(redirectUrl);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllHealthEntries,
    showHealthEntry,
    showHealthEntryForm,
    createHealthEntry,
    updateHealthEntry,
    deleteHealthEntry,
};
