const express = requre("express");
const Item = require("../models/item.model.js");
const router = express.Router();
const { getAllItems, getItemById, createItem, deleteItem, purchaseItem, gachaPull } = require("../controllers/item.controller.js");

router.get('/', getAllItems);
router.get('/:id', getItemById);

//update item details
router.post('/', createItem);
router.post('/shop/buy/:itemId', purchaseItem);
router.post('/gacha/pull', gachaPull);

//delete item
router.delete('/:id', deleteItem);

module.exports = router;