import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [listingType, setListingType] = useState("");
  const [minSqft, setMinSqft] = useState("");
  const [maxSqft, setMaxSqft] = useState("");
  const [amenities, setAmenities] = useState({});

  const navigate = useNavigate();

  const amenitiesList = [
    "Gymnasium", "SwimmingPool", "LiftAvailable", "24X7Security",
    "PowerBackup", "CarParking", "Wifi", "VaastuCompliant"
  ];

  const propertyTypes = ["Apartment", "Standalone", "Villa", "Row House"];
  const listingTypes = ["Buy", "Rent"];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/get-properties", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setProperties(Array.isArray(data) ? data : []);
        console.log(data)
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };

    fetchProperties();
  }, []);

  const handleAmenityChange = (key, value) => {
    setAmenities(prev => ({ ...prev, [key]: value }));
  };

  const filteredProperties = properties.filter(property => {
    const price = Number(property.Price);
    const area = Number(property.Area);
    if (city && property.City.toLowerCase() !== city.toLowerCase()) return false;
    if (minPrice && price < Number(minPrice)) return false;
    if (maxPrice && price > Number(maxPrice)) return false;
    if (listingType && property.ListingType !== listingType) return false;
    if (propertyType && property.PropertyType !== propertyType) return false;
    if (minSqft && area < Number(minSqft)) return false;
    if (maxSqft && area > Number(maxSqft)) return false;
    for (const [key, value] of Object.entries(amenities)) {
      if (value === "Don't Care") continue;
      if ((value === "Yes" && property.BinaryFeatures[key] !== "Yes") ||
          (value === "No" && property.BinaryFeatures[key] !== "No")) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="bg-[#0b0c10] min-h-screen text-white px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Explore Properties</h1>
      </div>

      <div className="max-w-5xl mx-auto mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="p-2 rounded bg-[#1a1a1a] text-white border border-gray-700"
          />
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="p-2 rounded bg-[#1a1a1a] text-white border border-gray-700"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="p-2 rounded bg-[#1a1a1a] text-white border border-gray-700"
          />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-3 text-sm flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
        >
          More Filters <ChevronDown size={16} />
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                className="p-2 bg-[#1a1a1a] text-white border border-gray-700"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">Property Type</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                className="p-2 bg-[#1a1a1a] text-white border border-gray-700"
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
              >
                <option value="">Listing Type</option>
                {listingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Min Sq Ft"
                value={minSqft}
                onChange={(e) => setMinSqft(e.target.value)}
                className="p-2 rounded bg-[#1a1a1a] text-white border border-gray-700"
              />
              <input
                type="number"
                placeholder="Max Sq Ft"
                value={maxSqft}
                onChange={(e) => setMaxSqft(e.target.value)}
                className="p-2 rounded bg-[#1a1a1a] text-white border border-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {amenitiesList.map(amenity => (
                <div key={amenity} className="flex flex-col text-sm">
                  <label className="text-white mb-1">{amenity}</label>
                  <select
                    value={amenities[amenity] || "Don't Care"}
                    onChange={(e) => handleAmenityChange(amenity, e.target.value)}
                    className="p-1 rounded bg-[#1a1a1a] text-white border border-gray-700"
                  >
                    <option value="Don't Care">Don't Care</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {filteredProperties.map((property) => (
          <div
            key={property._id}
            onClick={() => navigate(`/property-details/${property._id}`, { state: { property } })}
            className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow hover:shadow-xl transition hover:scale-[1.01] duration-300 cursor-pointer"
          >
            {property.images?.[0] && (
              <img
                src={`http://localhost:5000/uploads/${property.images[0]}`}
                alt="Property"
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">
                {property.PropertyType} - {property.Bedrooms} BHK
              </h3>
              <p className="text-yellow-400 font-bold mb-1">₹ {property.Price}</p>
              <p className="text-gray-400 text-sm">{property.City}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-full bg-yellow-600 hover:bg-yellow-700 text-sm font-medium text-white"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
