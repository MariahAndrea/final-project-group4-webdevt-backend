const User = require('../models/user.model');

const getUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existing = await User.findOne ({email});
        if (existing) return res.status(500).json({ message: "Account already exists." });
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
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
};

const updaterUserInfo = async (req, res) => {
    try{
       const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
       );
       if (!updatedUser) return res.status(404).json({ message: "User not found." });
       res.json({ message: "User updated", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) res.status(404).json({ error: "User not found." });
        res.send({ message: "User deleted successfully. "});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUser,
    registerUser,
    loginUser,
    updaterUserInfo,
    deleteUser
};