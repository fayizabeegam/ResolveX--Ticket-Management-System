import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FiMoreVertical } from "react-icons/fi";

const ITEMS_PER_PAGE = 9;

const AllDepartments = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = user?.role;

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [editDept, setEditDept] = useState(null);
  const [saving, setSaving] = useState(false);

  const dropdownRef = useRef(null);

  // Fetch departments
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("authToken");
      const res = await api.get("/departments/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data);
    } catch (err) {
      console.error(err.response || err.message);
      alert("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered departments
  const filtered = departments.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      const token = sessionStorage.getItem("authToken");
      await api.delete(`/departments/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Department deleted successfully!");
      fetchDepartments();
    } catch (err) {
      console.error(err.response || err.message);
      alert("Failed to delete department");
    }
  };

  const handleEditSave = async () => {
    if (!editDept) return;
    setSaving(true);
    try {
      const token = sessionStorage.getItem("authToken");
      await api.put(`/departments/${editDept.id}/`, {
        name: editDept.name,
        description: editDept.description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Department updated successfully!");
      setEditDept(null);
      fetchDepartments();
    } catch (err) {
      console.error(err.response || err.message);
      alert("Failed to update department");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Departments</h1>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3">
        <input
          type="text"
          placeholder="Search department..."
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full sm:w-1/3"
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        {role === "admin" && (
          <button
            onClick={() => navigate("/departments/create")}
            className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition"
          >
            Create Department
          </button>
        )} 
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading departments...</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No departments found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {paginated.map((dept) => (
            <div
              key={dept.id}
              className="relative bg-gradient-to-t from-sky-500 to-indigo-500 rounded-xl shadow-md p-6 flex items-center justify-center cursor-pointer hover:shadow-lg transition text-center font-semibold text-white text-lg"
            >
              <span onClick={() => navigate(`/departments/${dept.id}`)}>
                {dept.name}
              </span>

              {/* 3-dot menu */}
              {role === "admin" && (
                <div className="absolute top-2 right-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === dept.id ? null : dept.id);
                    }}
                    className="p-1 hover:bg-white/20 rounded-full transition"
                  >
                    <FiMoreVertical size={20} />
                  </button>

                  {openDropdown === dept.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg overflow-hidden z-50"
                    >
                      <button
                        onClick={() => {
                          setEditDept({ ...dept });
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-indigo-600 text-white" : "bg-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editDept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Edit Department</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Name</label>
                <input
                  name="name"
                  value={editDept.name}
                  onChange={(e) => setEditDept({ ...editDept, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Description</label>
                <textarea
                  name="description"
                  value={editDept.description}
                  onChange={(e) => setEditDept({ ...editDept, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  rows={4}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditDept(null)}
                className="px-5 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDepartments;