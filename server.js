const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user.model.js");
const userRoute = require("./routes/user.route.js");
const Pet = require("./models/pet.model.js");
const petRoute = require("./routes/pet.route.js");
const Item = require ("./models/item.model.js");
const itemRoute = require("./routes/item.route.js");

const app = express();
const PORT = process.env.PORT || 3000;
const uri = "mongodb://localhost:27017/starmu";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//use routes
app.use("/api/users", userRoute)
app.use("/api/pets", petRoute)
app.use("/api/items", itemRoute)

mongoose.connect(uri)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => console.error("Connection error", err));


app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
});