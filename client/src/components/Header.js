import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <header className="bg-[#0a0f1c] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="text-2xl font-bold text-white">
          <span className="text-[#FFD700]">Clear</span>PLOT
        </Link>

        {/* Buttons */}
        <div className="space-x-4 flex items-center">
          {isLoggedIn ? (
            <>
              <Link
                to="/post-property"
                className="px-4 py-2 rounded-lg bg-[#FFD700] text-[#0a0f1c] font-semibold hover:bg-white hover:text-[#0a0f1c] transition"
              >
                Post Property
              </Link>
              <Link
                to={`/user-profile/${token}`}
                className="px-4 py-2 rounded-lg border border-white hover:bg-white hover:text-[#0a0f1c] transition"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-white hover:bg-white hover:text-[#0a0f1c] transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg border border-white hover:bg-white hover:text-[#0a0f1c] transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-[#FFD700] text-[#0a0f1c] font-semibold hover:bg-white hover:text-[#0a0f1c] transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
