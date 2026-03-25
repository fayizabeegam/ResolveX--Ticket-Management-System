import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaEllipsisV,
  FaSearch,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBars
} from "react-icons/fa";
import api from "../api/axios";

const Topbar = ({ setSidebarOpen }) => {

  const [menuOpen, setMenuOpen] = useState(false);
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const logout = () => {

  const role = sessionStorage.getItem("userRole");

  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
  sessionStorage.removeItem("userRole");

  if (role === "client") {
    navigate("/login");
  } else {
    navigate("/staff-login");
  }

};

  useEffect(() => {
    api.get("tickets/notifications/")
      .then(res => setCount(res.data.unread_count))
      .catch(err => console.log(err));
  }, []);

  return (

    <div className="bg-white flex items-center justify-between px-4 sm:px-6 py-3 shadow mb-6">

      {/* Left */}
      <div className="flex items-center gap-3">

        <FaBars
          className="text-xl cursor-pointer md:hidden"
          onClick={() => setSidebarOpen(true)}
        />

        <h1 className="text-lg sm:text-xl font-semibold">
          Dashboard
        </h1>

      </div>

      {/* Search */}
      <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-lg w-64 lg:w-80">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Notification */}
        <div
          className="relative cursor-pointer"
          onClick={() => navigate("/notifications")}
        >
          <FaBell className="text-lg sm:text-xl text-gray-700 hover:text-blue-600 transition" />

          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
              {count}
            </span>
          )}
        </div>

        {/* Menu */}
        <div className="relative">

          <FaEllipsisV
            className="cursor-pointer text-gray-700 hover:text-blue-600 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          />

          {menuOpen && (
            <div className="absolute right-0 mt-3 bg-white shadow-lg rounded-xl w-44 border z-50">

              <button
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100"
                onClick={() => navigate("/profile")}
              >
                <FaUser className="text-gray-500" />
                Profile
              </button>

              <button
                className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100"
                onClick={() => navigate("/settings")}
              >
                <FaCog className="text-gray-500" />
                Settings
              </button>

              <button
                className="flex items-center gap-3 w-full px-4 py-2 text-red-500 hover:bg-red-50"
                onClick={logout}
              >
                <FaSignOutAlt />
                Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </div>

  );
};

export default Topbar;