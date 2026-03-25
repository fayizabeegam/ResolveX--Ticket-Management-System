import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FaUpload, FaTimes } from "react-icons/fa";

const CreateTicket = () => {
  const navigate = useNavigate();
  const user = useMemo(() => {
    return JSON.parse(sessionStorage.getItem("user")) || {};
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    department: user.role === "team_lead" ? user.department?.id || "" : "",
    priority: "medium",
  });

  console.log("USER OBJECT:", user);
  console.log("Form state:", form);
  
  const [departments, setDepartments] = useState([]);
  const [file, setFile] = useState(null);
  const [previewName, setPreviewName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //Fetch Departments
  useEffect(() => {
    if (user.role === "team_lead" && user.department) {
      setForm(prev => ({ ...prev, department: user.department.id }));
    }

    if (["admin", "manager", "client"].includes(user.role)) {
      const fetchDepartments = async () => {
        try {
          const res = await api.get("/departments/");
          setDepartments(res.data);
        } catch (err) {
          setError("Failed to load departments");
        }
      };
      fetchDepartments();
    }
  }, []);

  //Handle Input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //File Select
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreviewName(selected?.name || "");
  };

  //Remove File
  const removeFile = () => {
    setFile(null);
    setPreviewName("");
  };

  //Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("authToken");

      const payload = {
        ...form,
        department: Number(form.department), // convert to number
      };
      // Create Ticket
      const res = await api.post("/tickets/create/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ticketId = res.data.data.id;

      console.log(res.data);

      //Upload Attachment (if exists)
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        await api.post(
          `/tickets/${ticketId}/attachments/add/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      navigate("/tickets/all");

    } catch (err) {
      if (err.response?.data) {
        const messages = [];
        for (const key in err.response.data) {
          messages.push(`${key}: ${err.response.data[key]}`);
        }
        setError(messages.join(" | "));
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">

        {/*Header */}
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Create New Ticket
        </h2>

        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/*Title */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter ticket title"
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Department</label>
            <select
              name="department"
              value={form.department}
              disabled={user.role === "team_lead"}
              onChange={handleChange} 
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
              required
            >
              {user.role === "team_lead" ? (
                <option value={user.department?.id || ""}>
                  {user.department?.name || "No Department"}
                </option>
              ) : (
                <>
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          
          
          {/*Priority */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/*Attachment Upload */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Attachment</label>

            <div className="border-2 border-dashed rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <FaUpload />
                <span>{previewName || "Upload file"}</span>
              </div>

              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="fileUpload"
              />

              <label
                htmlFor="fileUpload"
                className="cursor-pointer bg-indigo-600 text-white px-3 py-1 rounded"
              >
                Browse
              </label>
            </div>

            {file && (
              <div className="mt-2 flex justify-between items-center bg-gray-100 p-2 rounded">
                <span className="text-sm">{previewName}</span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the issue..."
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/*Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Ticket"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateTicket;