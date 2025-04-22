const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  propertyType: { type: String, required: true },
  bhkType: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  propertyAge: { type: Number, required: true },
  facing: { type: String, required: true },
  furnishing: { type: String, required: true },
  builtUpArea: { type: Number, required: true },
  carpetArea: { type: Number, required: true },
  floorNumber: { type: Number, required: true },
  totalFloors: { type: Number, required: true },
  amenities: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  images: [String], // Assuming images are stored as an array of URLs or filenames
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
}, { timestamps: true });

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
