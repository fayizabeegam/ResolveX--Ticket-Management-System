import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateDepartment = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("authToken"); 
      const response = await api.post("/departments/", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Department created:", response.data);
      alert("Department created successfully!");
      navigate("/departments/all"); 

    } catch (err) {
      console.error(err.response || err.message);
      if (err.response?.data) {
        const messages = [];
        for (const key in err.response.data) {
          messages.push(`${key}: ${err.response.data[key]}`);
        }
        setError(messages.join(" | "));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Department</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          {/* Department Name */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Department Name"
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Department Description"
              className="w-full border border-gray-300 rounded-lg p-3"
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDepartment;