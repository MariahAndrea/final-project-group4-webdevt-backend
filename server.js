const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User.js");
const Pet = require("./models/Pet.js");
const Item = require("./models/Item.js");
const app = express();

app.use(express.json());

mongoose
    .connect("mongodb+srv://admin:admin123@backend.x3lbbcb.mongodb.net/?retryWrites=true&w=majority&appName=Backend")
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => console.error("Connection error", err));

// User Routes
app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully." });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try{
        const { username, password } = req.body;
        const user = await User.findOne ({ email, password });
        if (user) {
            res.status(200).json({ message: "Login successful." });
        } else {
            res.status(401).json({ error: "Invalid username or password." });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});