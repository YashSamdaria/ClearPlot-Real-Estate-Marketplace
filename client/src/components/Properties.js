import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { SERVER_URL } from "../config";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    propertyType: "",
    listingType: "",
    minSqft: "",
    maxSqft: "",
    amenities: {}
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();

  const amenitiesList = [
    "Gymnasium", "SwimmingPool", "LiftAvailable", "24X7Security",
    "PowerBackup", "CarParking", "Wifi", "VaastuCompliant"
  ];
  const propertyTypes = ["Apartment", "Standalone", "Villa", "Row House","Plot","Farmhouse","Penthouse","Duplex House","Loft","Cottage","Studio"];

  const listingTypes = ["Buy", "Rent"];

  const fetchProperties = async (paramsObj = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(paramsObj).forEach(([key, value]) => {
        if (!value) return;
        if (key === 'amenities') {
          Object.entries(value).forEach(([aKey, aValue]) => {
            if (aValue && aValue !== "Don't Care") {
              params.append(`amenities[${aKey}]`, aValue);
            }
          });
        } else {
          params.append(key, value);
        }
      });
      // default pagination
      params.append('page', 1);
      params.append('limit', 100);

      const token = localStorage.getItem('token');
      const url = params.toString()
        ? `${SERVER_URL}/get-properties?${params.toString()}`
        : `${SERVER_URL}/get-properties`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('API response:', data);
      setProperties(Array.isArray(data?.properties) ? data.properties : []);
      } catch (err) {
      console.error('Failed to fetch properties:', err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // on mount, fetch all
    fetchProperties();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      amenities: { ...prev.amenities, [key]: value }
    }));
  };

  const applySearch = () => {
    fetchProperties(filters);
  };

  return (
    <div className="bg-[#0b0c10] min-h-screen text-white px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Explore Properties</h1>
      </div>

      <div className="max-w-5xl mx-auto mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={e => handleFilterChange('city', e.target.value)}
            className="p-2 rounded bg-[#1a1a1a] text-white border border-gray-700"
          />
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={e => handleFilterChange('minPrice', e.target.value)}
            className="p-2 rounded bg-[#1a1a1a] text-white border border-gray-700"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={e => handleFilterChange('maxPrice', e.target.value)}
            className="p-2 rounded bg-[#1a1a1a] text-white border border-gray-700"
          />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-2 text-sm flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
        >
          More Filters <ChevronDown size={16} />
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                value={filters.propertyType}
                onChange={e => handleFilterChange('propertyType', e.target.value)}
                className="p-2 bg-[#1a1a1a] text-white border border-gray-700"
              >
                <option value="">Property Type</option>
                {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={filters.listingType}
                onChange={e => handleFilterChange('listingType', e.target.value)}
                className="p-2 bg-[#1a1a1a] text-white border border-gray-700"
              >
                <option value="">Listing Type</option>
                {listingTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                type="number"
                placeholder="Min Sq Ft"
                value={filters.minSqft}
                onChange={e => handleFilterChange('minSqft', e.target.value)}
                className="p-2 rounded bg-[#1a1a1a] text-white border border-gray-700"
              />
              <input
                type="number"
                placeholder="Max Sq Ft"
                value={filters.maxSqft}
                onChange={e => handleFilterChange('maxSqft', e.target.value)}
                className="p-2 rounded bg-[#1a1a1a] text-white border border-gray-700"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {amenitiesList.map(amenity => (
                <div key={amenity} className="flex flex-col text-sm">
                  <label className="text-white mb-1">{amenity}</label>
                  <select
                    value={filters.amenities[amenity] || "Don't Care"}
                    onChange={e => handleAmenityChange(amenity, e.target.value)}
                    className="p-1 rounded bg-[#1a1a1a] text-white border border-gray-700"
                  >
                    <option>Don't Care</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={applySearch}
            className="px-6 py-2 rounded bg-yellow-600 hover:bg-yellow-700 font-semibold flex items-center gap-2 mx-auto"
          >
            <Search size={16} /> Apply Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {properties.map(property => (
            <div
              key={property._id}
              onClick={() => navigate(`/property-details/${property._id}`, { state: { property } })}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow hover:shadow-xl transition hover:scale-[1.01] duration-300 cursor-pointer"
            >
              {property.images?.[0] && (
                <img
                  src={`${property.images[0]}`}
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
      )}

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
