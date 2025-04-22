import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

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
        setProperties(data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };
  
    fetchProperties();
  }, []);
  

  return (
    <div className="bg-[#0b0c10] min-h-screen text-white px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-wide">Explore Properties</h1>
        <p className="mt-1 text-gray-400 text-sm">Refined. Detailed. Neat.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {properties.map((property) => (
          <div
            key={property._id}
            onClick={() => navigate(`/property-details/${property._id}`, { state: { property } })}
            className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow hover:shadow-xl transition hover:scale-[1.01] duration-300"
          >
            {property.images?.[0] && (
              <img
                src={`http://localhost:5000/uploads/${property.images[0]}`}
                alt="Property"
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4 space-y-1">
              <h3 className="text-lg font-semibold">
                {property.propertyType} - {property.bhkType} BHK
              </h3>
              <p className="text-gray-400 text-xs">
                {property.area}, {property.city}
              </p>
              <p className="text-yellow-500 font-bold text-base">
                ₹ {property.price}
              </p>
              <div className="text-sm text-gray-300 grid grid-cols-2 gap-x-3 mt-2">
                <p>Built-up: {property.builtUpArea} sqft</p>
                <p>Carpet: {property.carpetArea} sqft</p>
                <p>Age: {property.propertyAge} yrs</p>
                <p>
                  Floor: {property.floorNumber}/{property.totalFloors}
                </p>
              </div>
              <Link
                to={`/property-details/${property._id}`}
                state={{ property }}
                className="inline-block mt-3 text-sm text-yellow-400 hover:text-yellow-500 underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-full bg-yellow-600 hover:bg-yellow-700 text-sm font-medium text-white shadow"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
