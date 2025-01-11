// controllers/healthEntry.js

const HealthEntry = require("../models/HealthEntry");
const sanitizeInput = require("../util/sanitizer");

const getAllHealthEntries = async (req, res) => {
    try {
        const {
            date,
            bloodSugarLevel,
            physicalActivity,
            mealLog,
            fastingGlucoseLevel,
            medicationsTaken,
            timeFrom,
            timeTo,
            page = 1,
            limit = 3
        } = req.query;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 3;

        const filters = { userId: req.user.id };

        if (date) {
            filters.date = new Date(date);
        }

        let timeFilter = {};
        if (timeFrom) {
            const timeFromStr = timeFrom.padStart(5, '0');
            timeFilter.$gte = timeFromStr;
        }
        if (timeTo) {
            const timeToStr = timeTo.padStart(5, '0');
            timeFilter.$lte = timeToStr;
        }
        if (Object.keys(timeFilter).length > 0) {
            filters.time = timeFilter;
        }

        if (bloodSugarLevel) {
            filters.bloodSugarLevel = Number(bloodSugarLevel);
        }

        if (medicationsTaken) {
            filters.medicationsTaken = { $regex: medicationsTaken, $options: 'i' };
        }

        if (physicalActivity) {
            filters.physicalActivityLog = { $regex: physicalActivity, $options: 'i' };
        }

        if (mealLog) {
            filters.mealLog = { $regex: mealLog, $options: 'i' };
        }

        if (fastingGlucoseLevel) {
            filters.fastingGlucoseLevel = fastingGlucoseLevel === 'true'; // Convert to Boolean
        }

        const skip = (pageNum - 1) * limitNum;

        const healthEntries = await HealthEntry.find(filters)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum);

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
            fastingFilter: fastingGlucoseLevel === 'true' ? 'true' : fastingGlucoseLevel === 'false' ? 'false' : null,
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

const createHealthEntry = async (req, res) => {
    try {
        const { date, time, bloodSugarLevel, medicationsTaken, physicalActivityLog, mealLog, fastingGlucoseLevel } = req.body;

        if (!date || !time) {
            req.flash("error", "Date and time are required.");
            return res.redirect("/healthEntries/form");
        }

        // Sanitize specific inputs
        const sanitizedMedicationsTaken = sanitizeInput(medicationsTaken);
        const sanitizedPhysicalActivityLog = sanitizeInput(physicalActivityLog);
        const sanitizedMealLog = sanitizeInput(mealLog);

        const healthEntry = new HealthEntry({
            userId: req.user.id,
            date: new Date(date),
            time,
            bloodSugarLevel,
            medicationsTaken: sanitizedMedicationsTaken,
            physicalActivityLog: sanitizedPhysicalActivityLog,
            mealLog: sanitizedMealLog,
            fastingGlucoseLevel: fastingGlucoseLevel === 'true'
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
        const { bloodSugarLevel, medicationsTaken, physicalActivityLog, mealLog, fastingGlucoseLevel, time, date } = req.body;

        const sanitizedMedicationsTaken = sanitizeInput(medicationsTaken);
        const sanitizedPhysicalActivityLog = sanitizeInput(physicalActivityLog);
        const sanitizedMealLog = sanitizeInput(mealLog);

        const healthEntry = await HealthEntry.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            {
                bloodSugarLevel,
                medicationsTaken: sanitizedMedicationsTaken,
                physicalActivityLog: sanitizedPhysicalActivityLog,
                mealLog: sanitizedMealLog,
                fastingGlucoseLevel: fastingGlucoseLevel === 'true',
                time,
                date: new Date(date)
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

const deleteHealthEntry = async (req, res) => {
    try {
        const healthEntry = await HealthEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!healthEntry) {
            req.flash("error", "Health entry not found.");
        }
        req.flash("success", "Health entry deleted successfully.");
        res.redirect("/healthEntries");
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
