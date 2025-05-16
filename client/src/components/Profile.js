import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { SERVER_URL } from "../config";

const Profile = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tokenString = String(token).trim();
        const decoded = jwtDecode(tokenString);
        const profileUserId = decoded.userId;

        const userRes = await fetch(`${SERVER_URL}/get-user/${profileUserId}`);
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setUser(userData);
        setName(userData.name);

        const propRes = await fetch(`${SERVER_URL}/api/properties?userId=${profileUserId}`);
        if (!propRes.ok) throw new Error("Failed to fetch properties");
        const propData = await propRes.json();
        setProperties(propData);

        const localToken = localStorage.getItem("token");
        if (localToken) {
          const localDecoded = jwtDecode(localToken);
          if (localDecoded.userId === profileUserId) setIsOwnProfile(true);
        }
      } catch (err) {
        setError("Failed to load: " + err.message);
      }
    };
    fetchData();
  }, [token]);

  const handleUpdate = async () => {
    try {
      const localToken = localStorage.getItem("token");
      const res = await fetch(`${SERVER_URL}/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localToken}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setUser(updated.user);
      setIsEditing(false);
    } catch {
      setError("Update error");
    }
  };

  const handleDeleteProperty = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${SERVER_URL}/api/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };

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
      {/* Profile Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8 shadow-xl">
          {isEditing ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  value={user?.email}
                  readOnly
                  className="w-full bg-gray-800/30 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                  placeholder="Email"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleUpdate}
                  className="bg-teal-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-teal-400 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-2">
                <div className="text-gray-300">
                  <span className="font-medium">Name: </span>
                  {user?.name}
                </div>
                <div className="text-gray-300">
                  <span className="font-medium">Email: </span>
                  {user?.email}
                </div>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-teal-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-teal-400 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>

        {/* Properties Section */}
        <h2 className="text-2xl font-bold text-white mb-6">Properties</h2>
        {properties.length > 0 ? (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {properties.map((property) => (
              <div
                key={property._id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {property.PropertyType} for {property.ListingType}
                </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-200 mb-6">
  <div className="space-y-3">
    <p>
      <span className="font-semibold text-lg text-white">City:</span>{" "}
      <span className="text-base text-gray-300">{property.City}</span>
    </p>
    <p>
      <span className="font-semibold text-lg text-white">Area:</span>{" "}
      <span className="text-base text-gray-300">{property.Area} sq.ft</span>
    </p>
  </div>
  <div className="space-y-3">
    <p>
      <span className="font-semibold text-lg text-white">Bedrooms:</span>{" "}
      <span className="text-base text-gray-300">{property.Bedrooms}</span>
    </p>
    <p>
      <span className="font-semibold text-lg text-white">Price:</span>{" "}
      <span className="text-base text-gray-300">₹{property.Price}</span>
    </p>
  </div>
</div>
                <p className="text-gray-300 text-sm mb-4">
      <span className="font-semibold text-lg text-white">Description :</span>{" "}
      <span className="text-base text-gray-300">{property.Description }</span>
                  </p>

                {/* Image Gallery */}
                {property.images?.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    {property.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Property ${index + 1}`}
                        className="w-32 h-24 object-cover rounded-lg border border-gray-700 hover:scale-105 transition-transform"
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {isOwnProfile && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate(`/edit-property/${property._id}`)}
                      className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(property._id)}
                      className="bg-red-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center text-gray-300">
            No properties found for this user.
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;