import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const ReportsPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState("");
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");

  // FETCH DATA
  const fetchOverdue = async () => {
    setLoading(true);
    try {
      const params = {};

      if (department) params.department = department;
      if (priority) params.priority = priority;
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;

      // Only fetch departments if user can see them
      let deptRes = { data: [] };
      if (user.role !== "employee") {
        deptRes = await api.get("/departments/");
        setDepartments(deptRes.data);
      }

      const ticketRes = await api.get("/dashboard/overdue/", { params });
      setTickets(ticketRes.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  // APPLY FILTER
  const applyFilters = () => {
    fetchOverdue();
  };

  //  EXPORT CSV
  const handleExport = async () => {
    try {
      const params = {
        department,
        priority,
        start_date,
        end_date,
      };

      const res = await api.get("/dashboard/export/csv/", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "tickets.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  // OVERDUE CALCULATION
  const isOverdue = (date) => {
    const created = new Date(date);
    const now = new Date();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays > 3;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">

        <h1 className="text-2xl font-bold text-gray-800">
          Reports
        </h1>

        <div className="flex gap-2 flex-wrap">

          {/* Department */}
          {user.role !== "employee" && (
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Dates */}
          <input
            type="date"
            value={start_date}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={end_date}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />

          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Apply
          </button>

          {user.role !== "employee" && (
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Export CSV
            </button>
          )}

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-3 text-left">Ticket ID</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Priority</th>
              {user.role !== "employee" && (
                <th className="p-3 text-left">Department</th>
              )}
              <th className="p-3 text-left">Assigned To</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">SLA</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No overdue tickets
                </td>
              </tr>
            ) : (
              tickets.map((t) => {
                const overdue = isOverdue(t.created_at);

                return (
                  <tr
                    key={t.ticket_id}
                    className={`border-t hover:bg-gray-50 ${
                      overdue ? "" : ""
                    }`}
                  >

                    <td className="p-3 text-sm">
                      <p
                        onClick={() => navigate(`/tickets/${t.id}`)}
                        className="text-xs text-gray-500 hover:underline cursor-pointer"
                      >
                        {t.ticket_id}
                      </p>
                      
                    </td>
                    <td className="p-3">
                      <p
                        onClick={() => navigate(`/tickets/${t.id}`)}
                        className="font-medium text-gray-600 hover:underline cursor-pointer"
                      >
                        {t.title}
                      </p>
                    </td>

                    <td className="p-3 capitalize">{t.status}</td>

                    <td className="p-3 capitalize">{t.priority}</td>
                    {user.role !== "employee" && (
                      <td className="p-3">{t.department}</td>
                    )}

                    <td className="p-3">
                      {t.assigned_to || "-"}
                    </td>

                    <td className="p-3 text-sm text-gray-500">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>

                    {/* SLA COLUMN */}
                    <td className="p-3">
                      {overdue ? (
                        <span className="text-red-600 font-semibold">
                          Breached ⚠️
                        </span>
                      ) : (
                        <span className="text-green-600">
                          On Time
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>
      </div>

    </div>
  );
};

export default ReportsPage;