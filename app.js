// app.js

const express = require("express");
require("express-async-errors");
require("dotenv").config();

const helmet = require('helmet');
const rateLimiter = require('express-rate-limit').default || require('express-rate-limit');
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const csrf = require("host-csrf");
const path = require("path"); // Import the `path` module

const app = express();

const PORT = process.env.PORT || 3000;

const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

app.use(express.json());

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'", // Allows inline scripts
                    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js", // Allow Bootstrap JS
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'", // Allows inline styles
                    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css", // Allow Bootstrap CSS
                    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css", // Allow FontAwesome CSS
                ],
                connectSrc: ["'self'"],
                imgSrc: ["'self'", "data:"],
                workerSrc: ["'self'", "blob:"], // Allow blob URLs for workers
            },
        },
        crossOriginEmbedderPolicy: false,
    })
);

app.use(express.static("public"));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'))); // Use `path.join` !!!

app.set("view engine", "ejs");

// Middleware to parse JSON and form data
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser(process.env.SESSION_SECRET));

// Session middleware setup
let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV === "test") {
    mongoURL = process.env.MONGO_URI_TEST;
}
const store = new MongoDBStore({
    uri: mongoURL,
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


app.get("/multiply", (req, res) => {
    let result = req.query.first * req.query.second;
    if (result.isNaN) {
        result = "NaN";
    } else if (result == null) {
        result = "null";
    }
    res.json({ result: result });
});

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

module.exports = { app };
