const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
     name: {
          type: String,
          required: [true, "Item name is required."]
     },
     category: {
          type: String,
          enum: ['accessory', 'furniture', 'consummable'],
          required: [true, "Item category is required."]
     },
     source: {
          type: String,
          enum: ['shop', 'gacha'],
          required: [true, "Item source is required."]
     }, 
     effect: {
          type: String,
     },
     price: {
          type: Number,
     },

}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;