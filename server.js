const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user.model.js");
const userRoute = require("./routes/user.route.js");
const Pet = require("./models/pet.model.js");
const petRoute = require("./routes/pet.route.js");
const Item = require ("./models/item.model.js");
const itemRoute = require("./routes/item.route.js");

const Item = require("./models/item.model.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/api/users", userRoute)
app.use("/api/pets", petRoute)
app.use("/api/items", itemRoute)


mongoose
    .connect("mongodb+srv://admin:admin123@backend.x3lbbcb.mongodb.net/?appName=Backend")
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => console.error("Connection error", err));