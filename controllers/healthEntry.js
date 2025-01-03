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
            filters['physicalActivities.name'] = { $regex: physicalActivity, $options: 'i' };
        }

        // Add meal log filter (case-insensitive search)
        if (mealLog) {
            filters['mealLog.foodName'] = { $regex: mealLog, $options: 'i' };
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
        res.status(500).send('An error occurred while fetching health entries.');
    }
};


const showHealthEntry = async (req, res, next) => {
    try {
        const healthEntry = await HealthEntry.findOne({ _id: req.params.id, userId: req.user.id });
        if (!healthEntry) {
            req.flash("error", "Health entry not found.");
            return res.redirect("/healthEntry");
        }
        res.render("showHealthEntry", { healthEntry, _csrf: res.locals._csrf });
    } catch (error) {
        next(error);
    }
};

const showHealthEntryForm = async (req, res, next) => {
    try {
        if (req.params.id) {
            const healthEntry = await HealthEntry.findOne({ _id: req.params.id, userId: req.user.id });
            if (!healthEntry) {
                req.flash("error", "Health entry not found.");
                return res.redirect("/healthEntries");
            }
            return res.render("healthEntry", { healthEntry, _csrf: res.locals._csrf });
        }
        // Render form for a new health entry
        res.render("healthEntry", { healthEntry: null, _csrf: res.locals._csrf });
    } catch (error) {
        req.flash("error", "An unexpected error occurred.");
        return next(error);
    }
};

const createHealthEntry = async (req, res, next) => {
    try {
        const { bloodSugarLevel, medicationsTaken, physicalActivityLog, mealLog, notes } = req.body;
        await HealthEntry.create({
            userId: req.user.id,
            bloodSugarLevel,
            medicationsTaken,
            physicalActivityLog,
            mealLog,
            notes,
        });
        res.redirect("/healthEntries");
    } catch (error) {
        next(error);
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
            req.flash("error", "Health entry not found.");
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
            req.flash("error", "Health entry not found.");
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
