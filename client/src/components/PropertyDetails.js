import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { SERVER_URL } from "../config";

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
          const userId =
            typeof property.userId === "object" ? property.userId.$oid || property.userId : property.userId;
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

  const lat = property.Latitude;
  const lng = property.Longitude;

  const binaryFeatures = Object.entries(property.BinaryFeatures || {})
    .filter(([_, value]) => value === "Yes")
    .map(([feature]) => feature);

  return (
    <div className="bg-[#0b0c10] text-white min-h-screen">
      {/* Carousel */}
      <Carousel
        showThumbs={false}
        showStatus={false}
        infiniteLoop
        autoPlay
        emulateTouch
        className="w-full max-w-4xl mx-auto"
      >
        {property.images?.map((img, i) => (
          <div key={i}>
            <img
              src={`${img}`}
              alt={`property-${i}`}
              className="object-cover h-[400px] w-full rounded-lg"
            />
          </div>
        ))}
      </Carousel>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-3xl font-bold">
          {property.PropertyType} - {property.Bedrooms} BHK
        </h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <p className="text-yellow-400 text-2xl font-semibold">₹ {property.Price}</p>
          <p className="text-green-400 text-xl font-medium">Predicted Price: ₹ {property.PredictedPrice}</p>
        </div>

        <p className="text-gray-400 text-lg">{property.Area} sqft, {property.City}</p>

        <div className="grid grid-cols-2 gap-4 text-md text-gray-300 mt-6">
          <p><span className="font-semibold text-white">Listing Type:</span> {property.ListingType}</p>
          <p><span className="font-semibold text-white">Furnishing:</span> Unfurnished</p>
          <p><span className="font-semibold text-white">Property Age:</span> Not specified</p>
          <p><span className="font-semibold text-white">Facing:</span> Not specified</p>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-2xl font-semibold mt-10 mb-2">Description</h2>
          <p className="text-gray-300 text-base leading-relaxed">{property.Description}</p>
        </div>

        {/* Binary Features Table */}
        {binaryFeatures.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mt-10 mb-2">Features</h2>
            <table className="table-auto w-full text-gray-300">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Feature</th>
                  <th className="px-4 py-2 text-left">Available</th>
                </tr>
              </thead>
              <tbody>
                {binaryFeatures.map((feature, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{feature}</td>
                    <td className="px-4 py-2">Yes</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
                  {property.City} - View on Google Maps
                </a>
              </Popup>
            </Marker>
          </MapContainer>
          <p className="text-sm text-gray-400 mt-1">Click on the marker for Google Maps</p>
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
