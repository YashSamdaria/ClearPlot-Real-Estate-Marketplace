import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { ML_URL, SERVER_URL } from "../config";

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const binaryFields = [
  "Resale",
  "MaintenanceStaff",
  "Gymnasium",
  "SwimmingPool",
  "LandscapedGardens",
  "JoggingTrack",
  "RainWaterHarvesting",
  "IndoorGames",
  "ShoppingMall",
  "Intercom",
  "SportsFacility",
  "ATM",
  "ClubHouse",
  "School",
  "24X7Security",
  "PowerBackup",
  "CarParking",
  "StaffQuarter",
  "Cafeteria",
  "MultipurposeRoom",
  "Hospital",
  "WashingMachine",
  "Gasconnection",
  "AC",
  "Wifi",
  "Childrensplayarea",
  "LiftAvailable",
  "BED",
  "VaastuCompliant",
  "Microwave",
  "GolfCourse",
  "TV",
  "DiningTable",
  "Sofa",
  "Wardrobe",
  "Refrigerator",
];

const PostProperty = () => {
  const [formData, setFormData] = useState({
    Area: "",
    "No. of Bedrooms": "",
    City: "",
    Latitude: "",
    Longitude: "",
    Price: "",
    PredictedPrice: "",
    Description: "",
    ListingType: "Buy",
    PropertyType: "Apartment",
    Furnishing: "Unfurnished",
    Facing: "East",
    ...binaryFields.reduce((o, f) => ({ ...o, [f]: "No" }), {}),
  });

  const [images, setImages] = useState([]);
  const [markerPosition, setMarkerPosition] = useState(null);
  const navigate = useNavigate();

  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        setMarkerPosition(e.latlng);
        setFormData((prev) => ({
          ...prev,
          Latitude: e.latlng.lat.toFixed(6),
          Longitude: e.latlng.lng.toFixed(6),
        }));
      },
    });
    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) return alert("Max 5 images");
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const buildPredictPayload = () => {
    const payload = {};
    payload.Area = Number(formData.Area);
    payload["No. of Bedrooms"] = Number(formData["No. of Bedrooms"]);
    payload.Latitude = Number(formData.Latitude);
    payload.Longitude = Number(formData.Longitude);
    binaryFields.forEach((f) => {
      payload[f] = formData[f] === "Yes" ? 1 : 0;
    });
    return payload;
  };

  const handlePredictPrice = async () => {
    try {
      const payload = buildPredictPayload();

      const res = await fetch(`${ML_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Prediction failed: " + (data.message || data.error));
        return;
      }

      let predictedPriceLakhs = Number(data.predicted_price);
      predictedPriceLakhs = predictedPriceLakhs * 100000;
      let predicted;
      if (formData.ListingType === "Rent") {
        predicted = (predictedPriceLakhs * 0.003).toFixed(0); // Rent in ₹
      } else {
        predicted = predictedPriceLakhs.toFixed(2); // Price in Lakhs
      }

      setFormData((prev) => ({ ...prev, PredictedPrice: predicted }));
    } catch (err) {
      console.error("Error during prediction:", err);
      alert("Error predicting price.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    if (!formData.PredictedPrice) await handlePredictPrice();

    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
    images.forEach((img) => payload.append("images", img));

    const res = await fetch(`${SERVER_URL}/post-properties`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    });
    if (res.ok) navigate("/properties");
    else alert("Submit failed");
  };

  const yesNo = ["Yes", "No"];
  const listingTypes = ["Buy", "Rent"];
  const propertyTypes = ["Apartment", "Standalone", "Villa", "Row House","Plot","Farmhouse","Penthouse","Duplex House","Loft","Cottage","Studio"];
  const furnishings = ["Unfurnished", "Semi Furnished", "Fully Furnished"];
  const facings = ["East", "West", "North", "South", "North-East", "South-West"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-8">List Your Property</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Listing & Property Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Listing Type</label>
              <select
                name="ListingType"
                value={formData.ListingType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {listingTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Property Type</label>
              <select
                name="PropertyType"
                value={formData.PropertyType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {propertyTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Furnishing & Facing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Furnishing</label>
              <select
                name="Furnishing"
                value={formData.Furnishing}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {furnishings.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Facing</label>
              <select
                name="Facing"
                value={formData.Facing}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {facings.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 mb-1">Upload Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-gray-700"
            />
            <div className="flex gap-4 mt-3 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-28 h-28">
                  <img
                    src={URL.createObjectURL(img)}
                    className="w-full h-full object-cover rounded-lg shadow"
                    alt={`Property Image ${idx}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 hover:bg-gray-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div>
            <label className="block text-gray-700 mb-1">Select Location on Map</label>
            <div className="rounded-lg overflow-hidden shadow">
              <MapContainer
                center={[12.9716, 77.5946]}
                zoom={13}
                style={{ height: 300, width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationSelector />
              </MapContainer>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handlePredictPrice}
              className="px-6 py-2 bg-white text-purple-700 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Predict Price
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostProperty;
