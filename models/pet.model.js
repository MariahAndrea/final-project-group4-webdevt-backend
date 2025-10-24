const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
     ownerID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
     },
     name: {
          type: String,
          required: [true, "Pet name is required."]
     },
     color: {
          type: String,
          enum: ["Purple", "Pink", "MintGreen", "BabyBlue", "Beige"],
          required: true
     },
     hunger: {
          type: Number,
          default: 100
     }, 
     happiness: {
          type: Number,
          default: 100
     },
     accessories: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item'
     }]
}, { timestamps: true });

const Pet = mongoose.model("Pet", petSchema);

module.exports = Pet;
