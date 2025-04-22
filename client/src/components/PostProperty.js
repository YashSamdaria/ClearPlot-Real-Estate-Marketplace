import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const PostProperty = () => {
  const [formData, setFormData] = useState({
    ownerName: "yash",
    contactNumber: "1234",
    propertyType: "Flat",
    bhkType: "2",
    city: "Bangalore",
    area: "Cubbonpet",
    propertyAge: "12",
    facing: "North",
    furnishing: "Semi",
    builtUpArea: "1200",
    carpetArea: "1000",
    floorNumber: "2",
    totalFloors: "2",
    amenities: "No pets",
    price: "1000000",
    description: "xxx yyyy zzzz",
    location: "12.9716,77.5946"
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
          location: `${e.latlng.lat},${e.latlng.lng}`,
        }));
      },
    });
    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert("You can only upload a maximum of 5 images.");
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in to submit a property.");
      return;
    }
  
    try {
      const payload = new FormData();
  
      // Append form fields
      for (const key in formData) {
        payload.append(key, formData[key]);
      }
  
      // Append images
      images.forEach((img) => payload.append("images", img));
  
      const res = await fetch("http://localhost:5000/post-properties", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Property submitted successfully!");
        setFormData({
          ownerName: "",
          contactNumber: "",
          propertyType: "",
          bhkType: "",
          city: "",
          area: "",
          propertyAge: "",
          facing: "",
          furnishing: "",
          builtUpArea: "",
          carpetArea: "",
          floorNumber: "",
          totalFloors: "",
          amenities: "",
          price: "",
          description: "",
          location: ""
        });
        setImages([]);
        setMarkerPosition(null);
        navigate("/properties");
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/20"
      >
        <h2 className="text-3xl font-bold text-center mb-6">Post Property</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "ownerName",
            "contactNumber",
            "bhkType",
            "city",
            "area",
            "propertyAge",
            "facing",
            "furnishing",
            "builtUpArea",
            "carpetArea",
            "floorNumber",
            "totalFloors",
            "amenities",
            "price",
          ].map((name) => (
            <input
              key={name}
              type={name.includes("Number") || name === "price" ? "number" : "text"}
              name={name}
              placeholder={name
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase())}
              onChange={handleChange}
              value={formData[name]}
              className="p-3 rounded-xl bg-white/10 border border-white/20 placeholder-white"
            />
          ))}

          <select
            name="propertyType"
            onChange={handleChange}
            value={formData.propertyType}
            className="p-3 rounded-xl bg-white/10 border border-white/20"
          >
            <option value="">Select Property Type</option>
            <option value="Flat">Flat</option>
            <option value="House">House</option>
            <option value="Plot">Plot</option>
          </select>
        </div>

        {/* Description + AI */}
        <div className="flex flex-col w-full pt-8">
          <div className="relative">
            <textarea
              value={formData.description}
              onChange={handleChange}
              rows={4}
              name="description"
              placeholder="Enter property description..."
              className="w-full my-auto p-3 rounded-xl bg-white/10 border border-white/20 placeholder-white"
            />
            <button
              type="button"
              className="absolute top-2 right-2 px-3 py-1 bg-purple-600 text-white text-xs rounded-md shadow hover:bg-purple-700 transition"
            >
              AI Enhance
            </button>
          </div>
        </div>

        {/* Image Upload */}
        <div className="mt-6">
          <label className="block text-lg font-medium text-white mb-2">Upload Images (max 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full text-white"
          />
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`preview-${idx}`}
                  className="rounded-lg border border-white/30 w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 text-xs bg-red-600 px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="mt-6">
          <label className="block text-lg font-medium text-white mb-2">
            Select Location on Map
          </label>
          <div className="h-64 w-full rounded-lg overflow-hidden border border-white/30">
            <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationSelector />
            </MapContainer>
          </div>
          {markerPosition && (
            <p className="text-sm text-white mt-2">
              Selected: {markerPosition.lat.toFixed(5)}, {markerPosition.lng.toFixed(5)} –&nbsp;
              <a
                href={`https://www.google.com/maps?q=${markerPosition.lat},${markerPosition.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-200"
              >
                📍 View on Google Maps
              </a>
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-6 w-full py-3 bg-purple-700 hover:bg-purple-800 rounded-xl text-white font-semibold text-lg transition"
        >
          Submit Property
        </button>
      </form>
    </div>
  );
};

export default PostProperty;
