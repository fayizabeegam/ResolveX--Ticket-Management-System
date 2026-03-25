import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  // read from user instead
  const user = JSON.parse(sessionStorage.getItem("user"));
  const showRegister = true;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/login/", formData);

      const role = response.data.role?.toLowerCase().trim();

      sessionStorage.setItem("access", response.data.access);
      sessionStorage.setItem("refresh", response.data.refresh);

      sessionStorage.setItem("user", JSON.stringify({
        ...response.data.user, 
        role: role
      }));

      console.log("SAVED ROLE:", role);

      alert("Login Successful!");
      navigate("/dashboard");

    } catch (error) {
      alert(JSON.stringify(error.response?.data || error.message));
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-black">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-xl shadow-lg">

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-200">Username</label>
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="mt-2 w-full rounded-md bg-gray-700 px-3 py-2 text-white"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-200">
                Password
              </label>

              <a
                href="/forgot-password"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </a>
            </div>

            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-md bg-gray-700 px-3 py-2 text-white"
            />
          </div>
          <button className="w-full bg-indigo-500 py-2 rounded text-white">
            Sign in
          </button>
        </form>

        {showRegister && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Not a member?{" "}
            <a href="/register" className="text-indigo-500 hover:text-indigo-400 font-medium">
              Register
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;