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

// --- USER ROUTES ---
//creates new user account
app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existing = await User.findOne ({email});
        if (existing) {
            return res.status(500).json({ message: "Account already exists." });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully." });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//logins a user
app.post("/api/auth/login", async (req, res) => {
    try{
        const { email, password } = req.body;
        const user = await User.findOne ({ email, password });
        if (user) {
            res.status(200).json({ message: "Login successful." });
        } else {
            res.status(401).json({ error: "Invalid username or password." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//get user details by ID
app.get("/api/users/:id", async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ error: "User not found." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//update user info or coins
app.put("/api/users/:id", async (req, res) => {
    try{
       const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
       );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//deletes a user account
app.delete("/api/users/:id", async (req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            res.status(404).json({ error: "User not found." });
        }
        res.send({ message: "User deleted successfully. "});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});