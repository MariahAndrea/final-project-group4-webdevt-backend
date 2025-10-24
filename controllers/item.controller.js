const Item = require("../models/item.model");
const User = require("../models/user.model");

const getAllItems = async (req, res) => {
    try{
        const item = await Item.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getItemById = async (req, res) => {
    try{
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ error: "Item not found." });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createItem = async (req, res) => {
    try{
        const item = new Item(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteItem = async (req, res) => {
    try{
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) res.status(404).json({ error: "Item not found." });
        res.send({ message: "Item deleted successfully. "});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const purchaseItem = async (req, res) => {
    try{
        const { userID } = req.body;
        const item = await Item.findById(req.params.itemId);
        const user = await User.findById(userId);

        if (!item || user) {
            return res.status(404).json({ error: "User or item not found." });
        }

        if (user.coins < item.price) {
            return res.status(400).json({ error: "Not enough coins." });
        }

        user.coins -= item.price;
        await user.save();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const gachaPull = async (req, res) => {
    try{
        const { userID } = req.body;
        const user = await User.findById(userId);
        const gachaItem = await Item.findById({ source: gacha });

        if (!user || gachaItem.length === 0) {
            return res.status(404).json({ error: "No gacha items available." });
        }

        const randomItem = gachaItem[Math.floor(Math.random() * gachaItems.length)];
        res.json({ message: "You got ", item: randomItem});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {

}