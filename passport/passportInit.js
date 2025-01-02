// passport/passportInit.js

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const passportInit = () => {
    passport.use(
        "local",
        new LocalStrategy(
            { usernameField: "email", passwordField: "password" },
            async (email, password, done) => {
                try {
                    const user = await User.findOne({ email: email });
                    if (!user) {
                        return done(null, false, { message: "Incorrect credentials - user's email." });
                    }

                    const result = await user.comparePassword(password);
                    if (result) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: "Incorrect credentials - password." });
                    }
                } catch (e) {
                    return done(e);
                }
            }
        )
    );

    passport.serializeUser(async function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        try {
            const user = await User.findById(id);
            if (!user) {
                return done(new Error("user not found"));
            }
            return done(null, user);
        } catch (e) {
            done(e);
        }
    });
};

module.exports = passportInit;
