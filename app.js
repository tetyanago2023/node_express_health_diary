// app.js

const express = require("express");
require("express-async-errors");
require("dotenv").config(); // Load environment variables from a .env file into process.env

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser"); // Added
const csrf = require("host-csrf"); // Added
const path = require("path"); // Import the `path` module

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'))); // Use `path.join` !!!

app.set("view engine", "ejs");

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser(process.env.SESSION_SECRET)); // Added

// Session middleware setup
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
    uri: url,
    collection: "mySessions",
});
store.on("error", function (error) {
    console.log(error);
});

const sessionParms = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));

const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(require("connect-flash")());

app.use(require("./middleware/storeLocals"));

// CSRF Middleware Setup
let csrf_development_mode = true;
if (app.get("env") === "production") {
    csrf_development_mode = false;
    app.set("trust proxy", 1);
}

const csrf_options = {
    protected_operations: ["PATCH", "POST", "DELETE"],
    protected_content_types: ["application/json", "application/x-www-form-urlencoded"],
    development_mode: csrf_development_mode,
};

const csrf_middleware = csrf(csrf_options); // Initialize and return middleware
app.use(csrf_middleware); // Add CSRF middleware after cookie and body parsers

// CSRF Token Logger
app.use((req, res, next) => {
    console.log(
        csrf_development_mode
            ? "CSRF protection is not secure because HTTP is used. Use HTTPS in production."
            : "CSRF protection enabled securely."
    );
    res.locals._csrf = csrf.token(req, res); // Make token available to templates
    next();
});

// Routes
app.get("/", (req, res) => {
    // res.render("index");
    const currentYear = new Date().getFullYear();
    res.render('index', { currentYear });
});
app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    next();
});

app.use("/sessions", require("./routes/sessionRoutes"));

const auth = require("./middleware/auth");
const healthEntryRouter = require("./routes/healthEntry");
app.use("/healthEntries", auth, healthEntryRouter);

const start = async () => {
    try {
        await require("./db/connect")(process.env.MONGO_URI);
        app.listen(PORT, () =>
            console.log(`Server running on http://localhost:${PORT}`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
