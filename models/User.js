require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        unique: true,
        maxlength: 50,
        minlength: 3,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true,
        lowercase: true, // Automatically convert emails to lowercase
        trim: true,      // Trim whitespace
    },
    password: {
        type: String,
        required: [true, 'Please provide a password with minimum 6 symbols'],
        minlength: 6,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    profile: {
        age: {
            type: Number,
            min: 0,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            default: 'other',
        },
    },
});

// Pre-save hook to hash the password
UserSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        console.log("Hashing password for:", this.email); // Debug
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
