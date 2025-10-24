const express = require("express");
const User = require("../models/user.model.js");
const router = express.Router();
const { getUser, registerUser, loginUser, updaterUserInfo, deleteUser } = require("../controllers/user.controller.js");

router.get('/:id', getUser);

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);

//update user info and coins
router.put('/:id', updaterUserInfo);

//delete account
router.delete('/:id', deleteUser);

module.exports = router; 
