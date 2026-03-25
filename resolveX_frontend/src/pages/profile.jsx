import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { FaUserCircle, FaDownload, FaTrash, FaCamera } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await API.get("/profile/");
    setUser(res.data);
    setFormData({
      username: res.data.username,
      email: res.data.email,
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    if (editing) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);

    if (selectedFile) {
      data.append("profile_picture", selectedFile);
    }

    const res = await API.patch("/profile/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setUser(res.data);
    setEditing(false);
    setPreview(null);
    setSelectedFile(null);
  };

  const handleDelete = async () => {
    const data = new FormData();
    data.append("remove_picture", "true");

    const res = await API.patch("/profile/", data);
    setUser(res.data);
    setPreview(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl p-6">

        {/* PROFILE IMAGE */}
        <div className="flex justify-center">
          <div
            className="relative group cursor-pointer"
            onClick={handleImageClick}
          >
            {user.profile_picture_url || preview ? (
              <img
                src={preview || user.profile_picture}
                alt="profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow"
              />
            ) : (
              <FaUserCircle className="w-32 h-32 text-gray-300" />
            )}

            {/* OVERLAY */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition">

              {/* Camera (only in edit) */}
              {editing && (
                <div className="bg-white p-2 rounded-full">
                  <FaCamera />
                </div>
              )}

              {/* Download */}
              {user.profile_picture && !editing && (
                <a
                  href={user.profile_picture}
                  download
                  className="bg-white p-2 rounded-full"
                >
                  <FaDownload />
                </a>
              )}

              {/* Delete */}
              {editing && user.profile_picture && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="bg-red-600 text-white p-2 rounded-full"
                >
                  <FaTrash />
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* DETAILS */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Username</span>
            {editing ? (
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="border px-2 py-1 rounded"
              />
            ) : (
              <span className="font-medium">{user.username}</span>
            )}
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Email</span>
            {editing ? (
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border px-2 py-1 rounded"
              />
            ) : (
              <span className="font-medium">{user.email}</span>
            )}
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Department</span>
            <span className="font-medium">
              {user.department?.name || "No Department"}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Role</span>
            <span className="font-medium capitalize">{user.role}</span>
          </div>
        </div>

        {/* BUTTON */}
        <div className="mt-8">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="w-full py-3 bg-green-600 text-white rounded-xl"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;