const express = require("express");
const Pet = require("../models/pet.model.js");
const router = express.Router();
const { getPetDetails, createPet, getUserDetails, feedPet, playWithPet, updatePetColor, renamePet, petAccessory, updatePetStats } = require("../controllers/pet.controller.js");

router.get('/:id', getPetDetails);
router.get('/owner/:ownerID', getUserDetails);

//create a new pet
router.post('/', createPet);

//update oet details
router.put('/:id/feed', feedPet);
router.put('/:id/play', playWithPet);
router.put('/:id/color', updatePetColor);
router.put('/:id/name', renamePet);
router.put('/:id/accessory', petAccessory);
// general update (hp/hunger/happiness etc)
router.put('/:id', updatePetStats);

module.exports = router;