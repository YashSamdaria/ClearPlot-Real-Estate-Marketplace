import React from "react";
import { ChevronDown } from "lucide-react";

const PropertySearch = ({
  city,
  setCity,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  propertyType,
  setPropertyType,
  listingType,
  setListingType,
  minSqft,
  setMinSqft,
  maxSqft,
  setMaxSqft,
  amenities,
  setAmenities,
  showAdvanced,
  setShowAdvanced,
}) => {
  const amenitiesList = [
    "Gymnasium", "SwimmingPool", "LiftAvailable", "24X7Security",
    "PowerBackup", "CarParking", "Wifi", "VaastuCompliant"
  ];

  const handleAmenityChange = (key, value) => {
    setAmenities(prev => ({ ...prev, [key]: value }));
  };

  return (
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
              {["Apartment", "Standalone", "Villa", "Row House"].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              className="p-2 bg-[#1a1a1a] text-white border border-gray-700"
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
            >
              <option value="">Listing Type</option>
              {["Buy", "Rent"].map(type => (
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
  );
};

export default PropertySearch;
