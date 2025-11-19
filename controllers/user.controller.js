const User = require('../models/user.model');

const getUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found." });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existing = await User.findOne ({ email });
        if (existing) return res.status(409).json({ message: "Account already exists." });
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                coins: newUser.coins,
                stargleams: newUser.stargleams,
                inventoryItems: newUser.inventoryItems,
                customizationItems: newUser.customizationItems
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try{
        const { emailOrUsername, password } = req.body;
        if (!emailOrUsername || !password) return res.status(400).json({ error: "Missing credentials." });

        const user = await User.findOne({
            $and: [
                { password },
                { $or: [{ email: emailOrUsername }, { username: emailOrUsername }] }
            ]
        });

        if (user) {
            res.status(200).json({
                message: "Login successful.",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    coins: user.coins,
                    stargleams: user.stargleams,
                    inventoryItems: user.inventoryItems,
                    customizationItems: user.customizationItems
                }
            });
        } else {
            res.status(401).json({ error: "Invalid username or password." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updaterUserInfo = async (req, res) => {
    try{
       // Load existing user so we can avoid accidentally overwriting
       // inventory/customization arrays when the client sends empty arrays
       const existing = await User.findById(req.params.id);
       if (!existing) return res.status(404).json({ message: "User not found." });

       const updates = {};
       for (const key of Object.keys(req.body || {})) {
           // If client sent an empty array for inventory/customization, skip it
           if ((key === 'inventoryItems' || key === 'customizationItems') && Array.isArray(req.body[key]) && req.body[key].length === 0) {
               continue;
           }
           updates[key] = req.body[key];
       }

       // If no valid updates remain, return the existing user
       if (Object.keys(updates).length === 0) return res.json({ message: "No updates applied", user: existing });

       const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
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