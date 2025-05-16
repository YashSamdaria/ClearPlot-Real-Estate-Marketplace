const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ListingType: { type: String, enum: ["Buy", "Rent"], required: true },
  PropertyType: { type: String, enum: ["Apartment", "Standalone", "Villa", "Row House", "Plot", "Farmhouse", "Penthouse", "Duplex House", "Loft", "Cottage", "Studio"], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  City: String,
  Area: Number,
  Bedrooms: Number,
  Latitude: Number,
  Longitude: Number,
  Price: Number,
  PredictedPrice: Number,
  Description:String,
  BinaryFeatures: { type: Map, of: String }, // Yes/No fields
  images: [String],
}, { timestamps: true });

module.exports = mongoose.model("Property", propertySchema);

