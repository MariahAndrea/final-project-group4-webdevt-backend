const Pet = require('../models/pet.model');
const User = require("../models/user.model");
const Item = require("../models/item.model");

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
        if (!ownerID || !name || !color) return res.status(400).json({ error: "ownerID, name and color are required." });

        // ensure owner exists
        const owner = await User.findById(ownerID);
        if (!owner) return res.status(404).json({ error: "Owner user not found." });

        const pet = new Pet({ ownerID, name, color });
        await pet.save();
        res.status(201).json(pet);
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

        // Diagnostic logging removed in production

        const pet = await Pet.findById(req.params.id);
        if (!pet) return res.status(404).json({ error: "Pet not found." });

        const ownerId = pet.ownerID;
        const owner = await User.findById(ownerId);
        if (!owner) return res.status(404).json({ error: "Owner user not found." });

        // try to find the item to get the name
        let itemDoc = null;
        try {
            itemDoc = await Item.findById(itemId);
        } catch (e) {
            // ignore — item might be a frontend-only object
        }
        const itemName = itemDoc ? itemDoc.name : (req.body.itemName || null);

        let updatedPet = null;

        if (action === "add") {
            // add accessory as an embedded object (snapshot of Item)
            // Before adding, remove any previously equipped accessory entries
            // so that only one accessory is equipped at a time.
            const prevAccessories = Array.isArray(pet.accessories) ? pet.accessories.slice() : [];

            // Determine which existing accessories (if any) should be removed.
            const removedAccessoryIds = prevAccessories
                .filter(a => a && ((a.category === 'accessory') || (a.type === 'accessory') || (a._id || a.id)))
                .map(a => String(a._id || a.id || a));

            if (removedAccessoryIds.length > 0) {
                pet.accessories = (pet.accessories || []).filter(a => {
                    if (!a) return true;
                    const aId = a._id || a.id || a;
                    return !removedAccessoryIds.includes(String(aId));
                });
            }

            const exists = (pet.accessories || []).some(a => {
                if (!a) return false;
                const aId = a._id || a.id || a;
                return String(aId) === String(itemId);
            });

            if (!exists) {
                pet.accessories = pet.accessories || [];
                if (itemDoc) {
                    // store a plain object snapshot to avoid mongoose document issues
                    pet.accessories.push(itemDoc.toObject ? itemDoc.toObject() : itemDoc);
                } else {
                    pet.accessories.push({ id: itemId, name: itemName });
                }
            }

            // If we removed previous accessory ids, mark them unequipped in owner's lists
            if (removedAccessoryIds.length > 0) {
                owner.inventoryItems = (owner.inventoryItems || []).map(iv => {
                    const ivId = iv && (iv.id || iv._id || iv);
                    if (ivId && removedAccessoryIds.includes(String(ivId))) {
                        return { ...(typeof iv === 'object' ? iv : {}), id: ivId, isEquipped: false };
                    }
                    return iv;
                });
                owner.customizationItems = (owner.customizationItems || []).map(ci => {
                    const ciId = ci && (ci.id || ci._id || ci);
                    if (ciId && removedAccessoryIds.includes(String(ciId))) {
                        return { ...(typeof ci === 'object' ? ci : {}), id: ciId, isEquipped: false };
                    }
                    return ci;
                });
            }

            // update user's inventory and customization lists: set isEquipped true on matching item, or add the item with isEquipped true
            owner.inventoryItems = owner.inventoryItems || [];
            owner.customizationItems = owner.customizationItems || [];
            let foundInv = false;
            owner.inventoryItems = owner.inventoryItems.map(iv => {
                const ivId = iv && (iv.id || iv._id || iv);
                if (ivId && String(ivId) === String(itemId)) {
                    foundInv = true;
                    return { ...(typeof iv === 'object' ? iv : {}), id: itemId, name: itemName || (iv && iv.name), quantity: iv.quantity ?? 1, isEquipped: true };
                }
                return iv;
            });
            if (!foundInv) {
                owner.inventoryItems.push({ id: itemId, name: itemName, quantity: 1, isEquipped: true });
            }

            let foundCust = false;
            owner.customizationItems = owner.customizationItems.map(ci => {
                const ciId = ci && (ci.id || ci._id || ci);
                if (ciId && String(ciId) === String(itemId)) {
                    foundCust = true;
                    return { ...(typeof ci === 'object' ? ci : {}), id: itemId, name: itemName || (ci && ci.name), quantity: ci.quantity ?? 1, isEquipped: true };
                }
                return ci;
            });
            if (!foundCust) {
                owner.customizationItems.push({ id: itemId, name: itemName, quantity: 1, isEquipped: true });
            }

            updatedPet = await pet.save();
            // we'll save owner after computing customizationItems below
        } else {
            // remove accessory object(s) from pet.accessories by matching id/_id
            pet.accessories = (pet.accessories || []).filter(a => {
                if (!a) return false;
                const aId = a._id || a.id || a;
                return String(aId) !== String(itemId);
            });

            // mark user's inventory and customization items as not equipped (or add back)
            owner.inventoryItems = owner.inventoryItems || [];
            owner.customizationItems = owner.customizationItems || [];
            let foundInv = false;
            owner.inventoryItems = owner.inventoryItems.map(iv => {
                const ivId = iv && (iv.id || iv._id || iv);
                if (ivId && String(ivId) === String(itemId)) {
                    foundInv = true;
                    return { ...(typeof iv === 'object' ? iv : {}), id: itemId, name: itemName || (iv && iv.name), quantity: iv.quantity ?? 1, isEquipped: false };
                }
                return iv;
            });
            if (!foundInv) {
                owner.inventoryItems.push({ id: itemId, name: itemName, quantity: 1, isEquipped: false });
            }

            let foundCust = false;
            owner.customizationItems = owner.customizationItems.map(ci => {
                const ciId = ci && (ci.id || ci._id || ci);
                if (ciId && String(ciId) === String(itemId)) {
                    foundCust = true;
                    return { ...(typeof ci === 'object' ? ci : {}), id: itemId, name: itemName || (ci && ci.name), quantity: ci.quantity ?? 1, isEquipped: false };
                }
                return ci;
            });
            if (!foundCust) {
                owner.customizationItems.push({ id: itemId, name: itemName, quantity: 1, isEquipped: false });
            }

            updatedPet = await pet.save();
            // we'll save owner after computing customizationItems below
        }

        // Normalize owner's inventoryItems to a consistent object shape
        // This prevents cases where inventory entries are raw ids or mixed shapes
        owner.inventoryItems = (owner.inventoryItems || []).map(iv => {
            if (iv == null) return null;
            if (typeof iv === 'object') {
                const idVal = iv.id || iv._id || iv;
                return {
                    id: String(idVal),
                    name: iv.name || null,
                    quantity: (typeof iv.quantity === 'number') ? iv.quantity : (iv.quantity ? Number(iv.quantity) : 1),
                    isEquipped: !!iv.isEquipped
                };
            }
            return { id: String(iv), name: null, quantity: 1, isEquipped: false };
        }).filter(Boolean);

        // Ensure owner.customizationItems contains all available accessory items
        try {
            const allAccessories = await Item.find({ category: 'accessory' });

            // Build a map of owner's inventory items keyed by possible id forms (id, _id, raw)
            const invMap = new Map();
            (owner.inventoryItems || []).forEach(iv => {
                if (iv == null) return;
                // iv may be an object or raw id
                const ids = [];
                if (typeof iv === 'object') {
                    if (iv.id) ids.push(String(iv.id));
                    if (iv._id) ids.push(String(iv._id));
                } else {
                    ids.push(String(iv));
                }
                // also allow numeric string forms
                ids.forEach(k => invMap.set(k, iv));
            });

            owner.customizationItems = allAccessories.map(a => {
                const candidateKeys = [];
                if (a._id) candidateKeys.push(String(a._id));
                if (typeof a.id !== 'undefined') candidateKeys.push(String(a.id));

                let inv = null;
                for (const k of candidateKeys) {
                    if (invMap.has(k)) { inv = invMap.get(k); break; }
                }

                return {
                    id: (typeof a.id !== 'undefined') ? a.id : a._id,
                    name: a.name,
                    quantity: inv ? (inv.quantity ?? 1) : 0,
                    isEquipped: !!(inv && inv.isEquipped)
                };
            });
        } catch (e) {
            // if Items collection missing or query fails, leave owner.customizationItems as-is
                if (String(process.env.DEBUG).toLowerCase() === 'true') {
                    console.warn('Could not build customizationItems list:', e && e.message);
                }
        }

        // save owner after customizationItems computed
        await owner.save();

        res.json({ pet: updatedPet, user: owner });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getUserDetails = async (req, res) => {
    try {
        const { ownerID } = req.params;
        const user = await User.findById(ownerID);
        if (!user) return res.status(404).json({ error: "User not found." });
        const pets = await Pet.find({ ownerID });
        res.status(200).json({ user, pets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update pet arbitrary stats (hp, hunger, happiness or others)
const updatePetStats = async (req, res) => {
    try {
        const updates = {};
        const allowed = ['hp', 'hunger', 'happiness', 'name', 'color', 'accessories'];
        for (const key of allowed) {
            if (typeof req.body[key] !== 'undefined') updates[key] = req.body[key];
        }
        if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update.' });
        const pet = await Pet.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
        if (!pet) return res.status(404).json({ error: 'Pet not found.' });
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
    petAccessory,
    updatePetStats
};
