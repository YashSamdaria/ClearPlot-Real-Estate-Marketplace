// [Same imports and icon fix as before]
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { ML_URL, SERVER_URL } from "../config";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const binaryFields = [
  "Resale", "MaintenanceStaff", "Gymnasium", "SwimmingPool", "LandscapedGardens", "JoggingTrack",
  "RainWaterHarvesting", "IndoorGames", "ShoppingMall", "Intercom", "SportsFacility", "ATM",
  "ClubHouse", "School", "24X7Security", "PowerBackup", "CarParking", "StaffQuarter", "Cafeteria",
  "MultipurposeRoom", "Hospital", "WashingMachine", "Gasconnection", "AC", "Wifi",
  "Childrensplayarea", "LiftAvailable", "BED", "VaastuCompliant", "Microwave", "GolfCourse",
  "TV", "DiningTable", "Sofa", "Wardrobe", "Refrigerator"
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
  const [enhanceLoading, setEnhanceLoading] = useState(false);
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
    const payload = {
      Area: Number(formData.Area),
      "No. of Bedrooms": Number(formData["No. of Bedrooms"]),
      Latitude: Number(formData.Latitude),
      Longitude: Number(formData.Longitude),
    };
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
      let predictedPriceLakhs = Number(data.predicted_price) * 100000;
      let predicted;
      if (formData.ListingType === "Rent") {
        predicted = (predictedPriceLakhs * 0.003).toFixed(0);
      } else {
        predicted = predictedPriceLakhs.toFixed(2);
      }
      setFormData((prev) => ({ ...prev, PredictedPrice: predicted }));
    } catch (err) {
      console.error("Error during prediction:", err);
      alert("Error predicting price.");
    }
  };

  const handleEnhanceDescription = async () => {
    if (!formData.Description.trim()) return alert("Enter a basic description first.");
    try {
      setEnhanceLoading(true);
      const res = await fetch(`${SERVER_URL}/enhance-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: formData.Description }),
      });
      const data = await res.json();
      if (!res.ok || !data.enhanced) {
        alert("Enhancement failed.");
        return;
      }
      setFormData((prev) => ({ ...prev, Description: data.enhanced }));
    } catch (err) {
      console.error("Enhance error:", err);
      alert("Failed to enhance.");
    } finally {
      setEnhanceLoading(false);
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
  const propertyTypes = ["Apartment", "Standalone", "Villa", "Row House", "Plot", "Farmhouse", "Penthouse", "Duplex House", "Loft", "Cottage", "Studio"];
  const furnishings = ["Unfurnished", "Semi Furnished", "Fully Furnished"];
  const facings = ["East", "West", "North", "South", "North-East", "South-West"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-8">List Your Property</h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Core Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="City" placeholder="City" value={formData.City} onChange={handleChange} className="border p-2 rounded" />
            <input name="Area" placeholder="Area (sqft)" value={formData.Area} onChange={handleChange} className="border p-2 rounded" />
            <input name="No. of Bedrooms" placeholder="No. of Bedrooms" value={formData["No. of Bedrooms"]} onChange={handleChange} className="border p-2 rounded" />
            <input name="Price" placeholder="Price" value={formData.Price} onChange={handleChange} className="border p-2 rounded" />
            <input name="PredictedPrice" placeholder="Predicted Price" value={formData.PredictedPrice} disabled className="border p-2 rounded bg-gray-100" />
            <input name="Latitude" placeholder="Latitude" value={formData.Latitude} disabled className="border p-2 rounded bg-gray-100" />
            <input name="Longitude" placeholder="Longitude" value={formData.Longitude} disabled className="border p-2 rounded bg-gray-100" />
          </div>

          {/* Listing/Furnishing/Facing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="ListingType" value={formData.ListingType} onChange={handleChange} className="border p-2 rounded">
              {listingTypes.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <select name="PropertyType" value={formData.PropertyType} onChange={handleChange} className="border p-2 rounded">
              {propertyTypes.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <select name="Furnishing" value={formData.Furnishing} onChange={handleChange} className="border p-2 rounded">
              {furnishings.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <select name="Facing" value={formData.Facing} onChange={handleChange} className="border p-2 rounded">
              {facings.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <textarea name="Description" rows={4} value={formData.Description} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Description" />
            <button type="button" onClick={handleEnhanceDescription} disabled={enhanceLoading} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded">
              {enhanceLoading ? "Enhancing..." : "Enhance Description"}
            </button>
          </div>

          {/* Binary Fields */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {binaryFields.map((field) => (
              <div key={field}>
                <label className="block text-sm text-gray-700">{field}</label>
                <select name={field} value={formData[field]} onChange={handleChange} className="w-full p-2 border rounded">
                  {yesNo.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Image Upload */}
          <div>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} />
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-28 h-28">
                  <img src={URL.createObjectURL(img)} className="object-cover w-full h-full rounded shadow" />
                  <button onClick={() => removeImage(idx)} type="button" className="absolute top-1 right-1 text-red-500 bg-white rounded-full px-1">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div>
            <label className="block text-gray-700 mb-1">Select Location on Map</label>
            <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: 300, width: "100%" }} className="rounded overflow-hidden shadow">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationSelector />
            </MapContainer>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={handlePredictPrice} className="px-6 py-2 bg-white text-purple-700 rounded-lg font-medium hover:bg-gray-100 transition">
              Predict Price
            </button>
            <button type="submit" className="px-6 py-2 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostProperty;
