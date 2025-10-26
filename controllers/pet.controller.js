const Pet = require('../models/pet.model');
const User = require("../models/user.model");

const getPetDetails = async (req, res) => {
    try{
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ error: "Pet not found." });
        res.status(200).json(pet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPet = async (req, res) => {
    try{
        const { ownerID, name, color } = req.body;
        const pet = new Pet({ ownerID, name, color });
        await pet.save(); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//updates hunger
const feedPet = async (req, res) => {
    try{
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ error: "Pet not found." }); 
        pet.hunger = Math.min(pet.hunger + 10, 100);
        await pet.save();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//updates happiness
const playWithPet = async (req, res) => {
    try{
        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ error: "Pet not found." });
        pet.happiness = Math.min(pet.happiness +10, 100);
        await pet.save();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePetColor = async (req, res) => {
    try{
        const { color } = req.body;
        const pet = await Pet.findByIdAndUpdate(
            req.params.id,
            { color },
            { new: true }
        );
        res.json(pet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const renamePet = async (req, res) => {
    try{
        const { name } = req.body;
        const pet = await Pet.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true }
        );
        res.json(pet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const petAccessory = async (req, res) => {
    try{
        const { itemId, action } = req.body;
        const update = 
        action === "add"
            ? { $addToSet: { accessories: itemId }}
            : { $pull: { accessories: itemId }};
        const pet = await Pet.findByIdAndUpdate(req.params.id, update, {new: true});
        res.json(pet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPetDetails, 
    getUserDetails,
    createPet,
    feedPet, 
    playWithPet,
    updatePetColor,
    renamePet,
    petAccessory
};