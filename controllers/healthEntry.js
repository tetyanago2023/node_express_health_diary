// controllers/healthEntry.js

const HealthEntry = require("../models/HealthEntry");

// controllers/healthEntry.js

const getAllHealthEntries = async (req, res) => {
    try {
        const { date, bloodSugarLevel, physicalActivity, mealLog, notes, medicationsTaken, timeFrom, timeTo, page = 1, limit = 10 } = req.query;

        // Parse page and limit values with default fallbacks
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;

        const filters = { userId: req.user.id }; // Add userId filter to ensure only entries for the current user are fetched

        // Add date filter (exact match or range if needed)
        if (date) {
            filters.date = new Date(date); // Parse the date input correctly
        }

        // Add blood sugar level filter (exact match or range)
        if (bloodSugarLevel) {
            filters.bloodSugarLevel = Number(bloodSugarLevel); // Ensure it's a number
        }

        // Add medications filter (case-insensitive search)
        if (medicationsTaken) {
            filters.medicationsTaken = { $regex: medicationsTaken, $options: 'i' };
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

        // Add time filtering logic
        let timeFilter = {};
        if (timeFrom) {
            const [hourFrom, minuteFrom] = timeFrom.split(':');
            const fromTime = new Date();
            fromTime.setHours(hourFrom, minuteFrom, 0, 0); // Set the time for the "timeFrom" filter
            timeFilter.$gte = fromTime; // Greater than or equal to the fromTime
        }

        if (timeTo) {
            const [hourTo, minuteTo] = timeTo.split(':');
            const toTime = new Date();
            toTime.setHours(hourTo, minuteTo, 0, 0); // Set the time for the "timeTo" filter
            timeFilter.$lte = toTime; // Less than or equal to the toTime
        }

        if (Object.keys(timeFilter).length > 0) {
            filters.time = timeFilter; // Add time filter to the filters
        }

        // Pagination settings
        const skip = (pageNum - 1) * limitNum;

        // Query the database for health entries belonging to the logged-in user
        const healthEntries = await HealthEntry.find(filters)
            .sort({ date: -1 }) // Sort by date in descending order
            .skip(skip)
            .limit(limitNum);

        // Count total documents for pagination
        const totalEntries = await HealthEntry.countDocuments(filters);

        res.render('healthEntries', {
            healthEntries,
            currentPage: pageNum,
            totalPages: Math.ceil(totalEntries / limitNum),
            limit: limitNum,
            hasPrevPage: pageNum > 1,
            hasNextPage: pageNum * limitNum < totalEntries,
            dateFilter: date || '',
            bloodSugarFilter: bloodSugarLevel || '',
            activityFilter: physicalActivity || '',
            mealLogFilter: mealLog || '',
            notesFilter: notes || '',
            medicationsFilter: medicationsTaken || '',
            timeFromFilter: timeFrom || '',
            timeToFilter: timeTo || ''
        });
    } catch (err) {
        console.error("Error fetching health entries:", err);
        req.flash('error', 'An error occurred while fetching health entries.');
        res.status(500).send('An error occurred while fetching health entries.');
    }
};


const showHealthEntry = async (req, res) => {
    try {
        const healthEntry = await HealthEntry.findOne({ _id: req.params.id, userId: req.user.id });
        if (!healthEntry) {
            req.flash("error", "Health entry not found.");
            return res.redirect("/healthEntries");
        }
        res.render("showHealthEntry", { healthEntry, _csrf: res.locals._csrf });
    } catch (error) {
        console.error("Error showing health entry:", error);
        req.flash("error", "An error occurred while displaying the health entry.");
        res.redirect("/healthEntries");
    }
};

const showHealthEntryForm = async (req, res) => {
    try {
        if (req.params.id) {
            const healthEntry = await HealthEntry.findOne({ _id: req.params.id, userId: req.user.id });
            if (!healthEntry) {
                req.flash("error", "Health entry not found.");
                return res.redirect("/healthEntries");
            }
            return res.render("healthEntry", { healthEntry, _csrf: res.locals._csrf });
        }
        res.render("healthEntry", { healthEntry: null, _csrf: res.locals._csrf });
    } catch (error) {
        console.error("Error displaying health entry form:", error);
        req.flash("error", "An error occurred while displaying the form.");
        res.redirect("/healthEntries");
    }
};

// controllers/healthEntry.js

const createHealthEntry = async (req, res) => {
    try {
        const { date, time, bloodSugarLevel, medicationsTaken, physicalActivityLog, mealLog, notes } = req.body;

        if (!date || !time) {
            req.flash("error", "Date and time are required.");
            return res.redirect("/healthEntries/form");
        }

        // Save the time directly as a string
        const healthEntry = new HealthEntry({
            userId: req.user.id,
            date: new Date(date), // Save the date as a Date object
            time, // Save the time as a string (e.g., "14:30")
            bloodSugarLevel,
            medicationsTaken,
            physicalActivityLog,
            mealLog,
            notes,
        });

        await healthEntry.save();
        res.redirect("/healthEntries");
    } catch (error) {
        console.error("Error creating health entry:", error);
        req.flash("error", "An error occurred while creating the health entry.");
        res.redirect("/healthEntries/form");
    }
};

const updateHealthEntry = async (req, res) => {
    try {
        const { bloodSugarLevel, medicationsTaken, physicalActivityLog, mealLog, notes, time } = req.body;

        // Parse the time field if provided
        let timeObj;
        if (time) {
            const [hour, minute] = time.split(':'); // Split time into hour and minute
            timeObj = new Date(req.body.date); // Create a date object from the provided date
            timeObj.setHours(hour, minute, 0, 0); // Set the time on the date object
        }

        const healthEntry = await HealthEntry.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            {
                bloodSugarLevel,
                medicationsTaken,
                physicalActivityLog,
                mealLog,
                notes,
                time: timeObj || undefined // Update the time field if it is provided
            },
            { new: true, runValidators: true }
        );

        if (!healthEntry) {
            req.flash("error", "Health entry not found.");
            return res.redirect("/healthEntries");
        }

        res.redirect("/healthEntries");
    } catch (error) {
        console.error("Error updating health entry:", error);
        req.flash("error", "An error occurred while updating the health entry.");
        res.redirect("/healthEntries");
    }
};

const deleteHealthEntry = async (req, res) => {
    try {
        const healthEntry = await HealthEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!healthEntry) {
            req.flash("error", "Health entry not found.");
        }
        const { page, limit, date } = req.query;
        const redirectUrl = `/healthEntries?page=${encodeURIComponent(page || 1)}&limit=${encodeURIComponent(limit || 10)}&date=${encodeURIComponent(date || '')}`;
        res.redirect(redirectUrl);
    } catch (error) {
        console.error("Error deleting health entry:", error);
        req.flash("error", "An error occurred while deleting the health entry.");
        res.redirect("/healthEntries");
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
