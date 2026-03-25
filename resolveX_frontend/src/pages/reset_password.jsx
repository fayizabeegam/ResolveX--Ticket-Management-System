import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";

const ResetPassword = () => {

  const { uid, token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: ""
  });

  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get("role");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post(`/reset-password/${uid}/${token}/`, formData);

      alert("Password reset successful!");

      if (["admin", "manager", "team_lead", "employee"].includes(role)) {
        navigate("/staff-login");
      } else if (role === "client") {
        navigate("/login");
      } else {
        navigate("/login");
      }

    } catch (error) {
      alert(JSON.stringify(error.response?.data || error.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow rounded w-96">

        <h2 className="text-xl font-bold mb-4">Reset Password</h2>

        <input
          type="password"
          name="new_password"
          placeholder="New Password"
          className="w-full p-3 border mb-4"
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          className="w-full p-3 border mb-4"
          onChange={handleChange}
        />

        <button className="w-full bg-green-600 text-white p-3 rounded">
          Reset Password
        </button>

      </form>
    </div>
  );
};

export default ResetPassword;