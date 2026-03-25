import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

const AdminRegisterUser = () => {

  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loadingDept, setLoadingDept] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "",
    department: ""
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await API.get("departments/");
        const data = res.data.results || res.data;
        setDepartments(data);
      } catch (error) {
        console.error("Department fetch failed:", error);
      } finally {
        setLoadingDept(false);
      }
    };
    fetchDepartments();
  }, []);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("admin/register-user/", formData);
      setMessage("User registered successfully!");
      setIsError(false);
      setTimeout(() => {
        navigate("/users/all");
        window.location.reload();
      }, 800);
    } catch (err) {
      setMessage(
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        "Error registering user"
      );
      setIsError(true);
    }
  };


  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 sm:p-10">

        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Register New User
          </h1>
          <p className="text-gray-500 mt-2">
            Create a new employee, manager, or team lead account
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              isError
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-green-100 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">Select Role</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="team_lead">Team Lead</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Department
            </label>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >

              {loadingDept ? (
                <option>Loading departments...</option>
              ) : (
                <>
                  <option value="">Select Department</option>

                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </>
              )}

            </select>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 pt-2">

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-sm transition duration-200"
            >
              Register User
            </button>

          </div>

        </form>

      </div>

    </div>

    );
};

export default AdminRegisterUser;

