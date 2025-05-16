import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate, useParams } from "react-router-dom";
import { SERVER_URL, ML_URL } from "../config";

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

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [existingImages, setExistingImages] = useState([]);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/properties/${id}`);
        if (!res.ok) throw new Error("Failed to fetch property");
        const data = await res.json();
        setFormData({
          Area: data.Area.toString(),
          "No. of Bedrooms": data.Bedrooms.toString(),
          City: data.City,
          Latitude: data.Latitude.toString(),
          Longitude: data.Longitude.toString(),
          Price: data.Price.toString(),
          PredictedPrice: data.PredictedPrice.toString(),
          Description: data.Description || "",
          ListingType: data.ListingType,
          PropertyType: data.PropertyType,
          Furnishing: data.Furnishing || "Unfurnished",
          Facing: data.Facing || "East",
          ...binaryFields.reduce((o, f) => ({ ...o, [f]: data.BinaryFeatures[f] || "No" }), {}),
        });
        setExistingImages(data.images || []);
        setMarkerPosition([data.Latitude, data.Longitude]);
      } catch (err) {
        setError("Failed to load property: " + err.message);
      }
    };
    fetchProperty();
  }, [id]);

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
    if (files.length + images.length + existingImages.length > 5) return alert("Max 5 images");
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const removeExistingImage = (idx) => setExistingImages((prev) => prev.filter((_, i) => i !== idx));

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

    try {
      const res = await fetch(`${SERVER_URL}/api/properties/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      if (res.ok) navigate("/properties");
      else {
        const data = await res.json();
        alert("Update failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  const yesNo = ["Yes", "No"];
  const listingTypes = ["Buy", "Rent"];
  const propertyTypes = ["Apartment", "Standalone", "Villa", "Row House", "Plot", "Farmhouse", "Penthouse", "Duplex House", "Loft", "Cottage", "Studio"];
  const furnishings = ["Unfurnished", "Semi Furnished", "Fully Furnished"];
  const facings = ["East", "West", "North", "South", "North-East", "South-West"];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Edit Property</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
              <input
                name="City"
                value={formData.City}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Area (sq.ft)</label>
              <input
                name="Area"
                value={formData.Area}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Area (sqft)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">No. of Bedrooms</label>
              <input
                name="No. of Bedrooms"
                value={formData["No. of Bedrooms"]}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="No. of Bedrooms"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
              <input
                name="Price"
                value={formData.Price}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Predicted Price</label>
              <input
                name="PredictedPrice"
                value={formData.PredictedPrice}
                disabled
                className="w-full bg-gray-800/30 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                placeholder="Predicted Price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Latitude</label>
              <input
                name="Latitude"
                value={formData.Latitude}
                disabled
                className="w-full bg-gray-800/30 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                placeholder="Latitude"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Longitude</label>
              <input
                name="Longitude"
                value={formData.Longitude}
                disabled
                className="w-full bg-gray-800/30 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                placeholder="Longitude"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Listing Type</label>
              <select
                name="ListingType"
                value={formData.ListingType}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {listingTypes.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Property Type</label>
              <select
                name="PropertyType"
                value={formData.PropertyType}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {propertyTypes.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Furnishing</label>
              <select
                name="Furnishing"
                value={formData.Furnishing}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {furnishings.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Facing</label>
              <select
                name="Facing"
                value={formData.Facing}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {facings.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              name="Description"
              rows={4}
              value={formData.Description}
              onChange={handleChange}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Description"
            />
            <button
              type="button"
              onClick={handleEnhanceDescription}
              disabled={enhanceLoading}
              className="mt-3 bg-teal-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-teal-400 transition-colors disabled:bg-teal-700 disabled:cursor-not-allowed"
            >
              {enhanceLoading ? "Enhancing..." : "Enhance Description"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {binaryFields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-300 mb-1">{field}</label>
                <select
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {yesNo.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Upload Images (Max 5)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-black file:font-semibold hover:file:bg-teal-400"
            />
            <div className="flex flex-wrap gap-4 mt-4">
              {existingImages.map((img, idx) => (
                <div key={`existing-${idx}`} className="relative w-28 h-28">
                  <img src={img} className="object-cover w-full h-full rounded-lg border border-gray-600" alt="Existing" />
                  <button
                    onClick={() => removeExistingImage(idx)}
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.map((img, idx) => (
                <div key={`new-${idx}`} className="relative w-28 h-28">
                  <img src={URL.createObjectURL(img)} className="object-cover w-full h-full rounded-lg border border-gray-600" alt="New" />
                  <button
                    onClick={() => removeImage(idx)}
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Location on Map</label>
            <MapContainer
              center={markerPosition || [12.9716, 77.5946]}
              zoom={13}
              style={{ height: 300, width: "100%" }}
              className="rounded-lg overflow-hidden shadow-lg"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationSelector />
            </MapContainer>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handlePredictPrice}
              className="bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors"
            >
              Predict Price
            </button>
            <button
              type="submit"
              className="bg-teal-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-teal-400 transition-colors"
            >
              Update Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;