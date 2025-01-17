const connectDB = require('../db/connect');
const HealthEntry = require("../models/HealthEntry");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;
const FactoryBot = require("factory-bot");
require("dotenv").config();

const testUserPassword = faker.internet.password();
const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdapter();
factory.setAdapter(factoryAdapter);

/// Define factory for HealthEntry
factory.define("healthEntry", HealthEntry, {
    date: () => faker.date.recent({ days: 30 }),
    time: () => faker.date.between({ from: new Date('2025-01-01T05:00:00'), to: new Date('2025-01-01T22:00:00') }).toTimeString().slice(0, 5), // Fixed
    bloodSugarLevel: () => faker.number.int({ min: 70, max: 200 }),
    medicationsTaken: () => faker.lorem.words({ min: 1, max: 5 }),
    physicalActivityLog: () => faker.lorem.words({ min: 3, max: 10 }),
    mealLog: () => faker.lorem.sentence(),
    fastingGlucoseLevel: () => faker.datatype.boolean(),
    userId: async () => {
        const testUser = await User.findOne();
        if (!testUser) {
            // Create the test user first if not already created
            const newUser = await factory.create("user", { password: testUserPassword });
            console.log("Created new test user:", newUser);
            return newUser._id; // Return the created user's ID
        }
        console.log("Found existing test user:", testUser); // Log if user found
        return testUser._id; // If a user already exists, use their ID
    },
});

// Define factory for User
factory.define("user", User, {
    name: () => faker.person.fullName(),
    email: () => faker.internet.email(),
    password: () => faker.internet.password(),
});

const seed_db = async () => {
    let testUser = null;
    try {
        const mongoURL = process.env.MONGO_URI_TEST;

        console.log("Seeding process started...");
        console.log("MongoDB URL:", mongoURL); // Log the MongoDB URL to check if it's correct

        // Connect to the database first
        await connectDB(mongoURL);
        console.log('MongoDB connected for seeding.');

        // Clear existing records
        console.log("Deleting existing health entries...");
        await HealthEntry.deleteMany({});
        console.log("Health entries deleted.");
        console.log("Deleting existing users...");
        await User.deleteMany({});
        console.log("Users deleted.");

        // Create a test user
        console.log("Creating test user...");
        testUser = await factory.create("user", { password: testUserPassword });
        console.log("Test user created:", testUser);

        // Seed health entries for the test user
        console.log("Creating health entries...");
        await factory.createMany("healthEntry", 20, { userId: testUser._id });
        console.log("20 health entries created for the test user.");

        console.log("Database seeded successfully.");
    } catch (e) {
        console.log("Database error:", e.message);
        throw e;
    }
    return testUser;
};

// Call the seed_db function to trigger the process
seed_db();
