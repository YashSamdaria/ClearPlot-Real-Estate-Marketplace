import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function PropertyDetails() {
  const { id } = useParams();
  const location = useLocation();
  const passedProperty = location.state?.property;
  const [poster, setPoster] = useState(null);
  const [property, setProperty] = useState(passedProperty || null);

  useEffect(() => {
    if (property && property.userId) {
      const fetchPoster = async () => {
        try {
          const userId = typeof property.userId === "object" ? property.userId.$oid || property.userId : property.userId;
          const res = await fetch(`http://localhost:5000/get-user/${userId}`);
          const data = await res.json();
          setPoster(data);
        } catch (err) {
          console.error("Error fetching poster info:", err);
        }
      };
      fetchPoster();
    }
  }, [property]);

  if (!property) return <div className="text-white p-10 text-center">Loading...</div>;

  const [lat, lng] = property.location.split(",").map(Number);

  return (
    <div className="bg-[#0b0c10] text-white min-h-screen">
      {/* Carousel */}
      <Carousel
        showThumbs={false}
        showStatus={false}
        infiniteLoop
        dynamicHeight={false}
        autoPlay
        emulateTouch
        className="w-full max-w-4xl mx-auto"
      >
        {property.images?.map((img, i) => (
          <div key={i}>
            <img
              src={`http://localhost:5000/uploads/${img}`}
              alt={`property-${i}`}
              className="object-cover h-[400px] w-full rounded-lg"
            />
          </div>
        ))}
      </Carousel>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-4xl font-bold">
          {property.propertyType} - {property.bhkType} BHK
        </h1>
        <p className="text-yellow-400 text-2xl font-semibold">₹ {property.price}</p>
        <p className="text-gray-400 text-lg">{property.area}, {property.city}</p>

        <div className="grid grid-cols-2 gap-6 text-md text-gray-300 mt-6">
          <p><span className="text-white font-semibold">Built-up:</span> {property.builtUpArea} sqft</p>
          <p><span className="text-white font-semibold">Carpet:</span> {property.carpetArea} sqft</p>
          <p><span className="text-white font-semibold">Floor:</span> {property.floorNumber}/{property.totalFloors}</p>
          <p><span className="text-white font-semibold">Furnishing:</span> {property.furnishing}</p>
          <p><span className="text-white font-semibold">Age:</span> {property.propertyAge} yrs</p>
          <p><span className="text-white font-semibold">Facing:</span> {property.facing}</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mt-10 mb-2">Description</h2>
          <p className="text-gray-300 text-base leading-relaxed">{property.description}</p>
        </div>

        {/* Map */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-2">Location</h2>
          <MapContainer
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={false}
            className="h-72 rounded-lg shadow-lg"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lng]}>
              <Popup>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {property.area}, {property.city} - View on Google Maps
                </a>
              </Popup>
            </Marker>
          </MapContainer>
          <p className="text-sm text-gray-400 mt-1">Click on the location for Google Maps</p>
        </div>

        {/* Posted By */}
        {poster && (
          <div className="mt-10 border-t border-gray-700 pt-6">
            <h2 className="text-2xl font-semibold mb-2">Posted By</h2>
            <p className="text-gray-300 text-lg">
              <span className="font-semibold text-white">Name:</span> {poster.name}
            </p>
            <p className="text-gray-300 text-lg">
              <span className="font-semibold text-white">Email:</span> {poster.email}
            </p>
            {/* Optional - in case you add phone to user schema later */}
            {poster.phone && (
              <p className="text-gray-300 text-lg">
                <span className="font-semibold text-white">Phone:</span> {poster.phone}
              </p>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center pt-10">
          <Link
            to="/properties"
            className="px-6 py-3 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium text-lg"
          >
            Back to Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
