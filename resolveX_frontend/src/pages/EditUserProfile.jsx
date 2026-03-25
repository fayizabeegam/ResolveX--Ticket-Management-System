import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const EditUserProfile = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "",
    department: ""
  });

  // Fetch user
  useEffect(() => {

    const fetchUser = async () => {

      try {

        const res = await API.get(`users/${id}/`);
        const user = res.data;

        setForm({
          username: user.username || "",
          email: user.email || "",
          role: user.role || "",
          department: user.department?.id || ""
        });

      } catch (err) {

        console.error("User fetch error:", err);

      } finally {

        setLoading(false);

      }

    };

    fetchUser();

  }, [id]);


  // Fetch departments
  useEffect(() => {

    const fetchDepartments = async () => {

      try {

        const res = await API.get("departments/");
        const data = res.data.results || res.data;

        setDepartments(data);

      } catch (err) {

        console.error("Departments fetch error:", err);

      }

    };

    fetchDepartments();

  }, []);


  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await API.patch(`users/${id}/`, form);

      alert("User updated successfully");

      navigate(`/users/profile/${id}`);

    } catch (err) {

      console.error("Update error:", err);

    }

  };


  if (loading) {

    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading user data...
      </div>
    );

  }


  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Edit User
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >

          {/* Username */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Username
            </label>

            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Email
            </label>

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Role
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3"
            >

              <option value="">Select Role</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="team_lead">Team Lead</option>
              <option value="client">Client</option>

            </select>

          </div>

          {/* Department */}
          <div>

            <label className="text-sm text-gray-600 block mb-1">
              Department
            </label>

            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3"
            >
              <option value="">Select Department</option>

              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

          </div>


          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded"
            >
              Save Changes
            </button>

          </div>

        </form>

      </div>

    </div>

  );

};

export default EditUserProfile;