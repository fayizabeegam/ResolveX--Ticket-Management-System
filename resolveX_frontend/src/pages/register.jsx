import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    department: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

     try {
        const response = await API.post(
        "/register/",
        formData
        );

      alert("Registration Successful!");
      console.log(response.data);
      navigate("/login");

    } catch (error) {
      console.log(error.response);
      alert(JSON.stringify(error.response?.data));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Register</h2>

        <input name="username" placeholder="Username"
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded bg-gray-700 text-white placeholder-white" />

        <input name="email" type="email" placeholder="Email"
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded bg-gray-700 text-white placeholder-white " />

        <input name="password" type="password" placeholder="Password"
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded bg-gray-700 text-white placeholder-white" />

        <input name="confirm_password" type="password" placeholder="Confirm Password"
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded bg-gray-700 text-white placeholder-white" />

        <button className="w-full bg-blue-600 text-white p-3 rounded">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;