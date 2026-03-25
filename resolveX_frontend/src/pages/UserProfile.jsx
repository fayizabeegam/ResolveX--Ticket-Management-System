import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { FaUserCircle } from "react-icons/fa";

const UserProfile = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get(`users/${id}/`)
      .then(res => setUser(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const toggleStatus = async () => {
    try {
      const res = await api.patch(`users/${id}/toggle-status/`);
      setUser(prev => ({
        ...prev,
        is_active: res.data.is_active
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">

      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl p-6">

        {/* PROFILE IMAGE */}
        <div className="flex justify-center">
          <div className="relative">

            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow"
              />
            ) : (
              <FaUserCircle className="w-32 h-32 text-gray-300" />
            )}

          </div>
        </div>

        {/* USER INFO */}
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold">{user.username}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>

        {/* DETAILS */}
        <div className="mt-6 space-y-4 text-sm">

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Role</span>
            <span className="font-medium capitalize">
              {user.role?.replace("_", " ")}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Department</span>
            <span className="font-medium">
              {user.department?.name || "-"}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium ${
              user.is_active ? "text-green-600" : "text-red-600"
            }`}>
              {user.is_active ? "Active" : "Blocked"}
            </span>
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 space-y-3">

          <button
            onClick={() => navigate(`/users/edit/${user.id}`)}
            className="w-full py-3 bg-blue-600 text-white rounded-xl"
          >
            Edit User
          </button>

          <button
            onClick={toggleStatus}
            className={`w-full py-3 text-white rounded-xl ${
              user.is_active
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {user.is_active ? "Block User" : "Unblock User"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default UserProfile;