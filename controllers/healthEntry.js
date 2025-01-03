// controller/healthEntry.js

const HealthEntry = require("../models/HealthEntry");

const getAllHealthEntries = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new Error("User information is missing.");
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const dateFilter = req.query.date || '';

        const healthEntries = await HealthEntry.find({
            userId: req.user.id,
            date: { $regex: dateFilter, $options: 'i' }
        })
            .sort('-date') // Sort by date, descending
            .skip(skip)
            .limit(limit);

        const totalHealthEntries = await HealthEntry.countDocuments({
            userId: req.user.id,
            date: { $regex: dateFilter, $options: 'i' }
        });

        const totalPages = Math.ceil(totalHealthEntries / limit);

        res.render("healthEntries", {
            healthEntries,
            currentPage: page,
            totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            limit,
            dateFilter
        });
    } catch (error) {
        next(error);
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
                return res.redirect("/health-entries");
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
        res.redirect("/health-entries");
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
            return res.redirect("/health-entries");
        }
        res.redirect("/health-entries");
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

        const redirectUrl = `/health-entries?page=${encodeURIComponent(page || 1)}&limit=${encodeURIComponent(limit || 10)}&date=${encodeURIComponent(date || '')}`;

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
