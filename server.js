const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// Load environment variables without dotenv's verbose output
require('dotenv').config({ debug: false });

const userRoute = require("./routes/user.route.js");
const petRoute = require("./routes/pet.route.js");
const itemRoute = require("./routes/item.route.js");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI and options
const uri = process.env.MONGODB_URI || "mongodb+srv://admin:admin@backend.x3lbbcb.mongodb.net/starmu?retryWrites=true&w=majority";
const mongooseOptions = {
    dbName: process.env.MONGODB_DBNAME || 'starmu',
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware for frontend requests (using official package)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://final-project-group4-webdevt-frontend-bf96.onrender.com";
app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"]
}));

// Simple request logger for diagnostics
const debugEnabled = String(process.env.DEBUG).toLowerCase() === 'true';
const dlog = (...args) => { if (debugEnabled) console.log(...args); };
const derr = (...args) => { if (debugEnabled) console.error(...args); };

app.use((req, res, next) => {
    try {
        dlog(`[req] ${req.method} ${req.originalUrl} - body:`, req.body);
    } catch (e) {
        dlog('[req] could not log request body');
    }
    next();
});


// Routes
app.use("/api/users", userRoute);
// Support requests that use the `/users` prefix (some frontends call this path without `/api`)
app.use("/users", userRoute);
app.use("/api/pets", petRoute);
app.use("/api/items", itemRoute);

// Connect to MongoDB
mongoose.connect(uri, mongooseOptions)
    .then(() => {
        const dbName = mongoose.connection?.db?.databaseName;
        console.log(`Successfully connected to MongoDB (database: ${dbName})`);
    })
    .catch((err) => console.error("Connection error", err));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
