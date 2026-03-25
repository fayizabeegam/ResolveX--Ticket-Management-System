import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

const AllTickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const role = user?.role?.toLowerCase().trim();

  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [tab, setTab] = useState("all");
  const [priority, setPriority] = useState("all");
  const [department, setDepartment] = useState("all");

  const [loading, setLoading] = useState(true);

  //same as DepartmentDetails
  const badgeBase =
    "inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-md min-w-[100px] h-[26px] capitalize";

  //Status Style
  const getStatusStyle = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-600 text-white";
      case "assigned":
        return "bg-orange-600 text-white";
      case "in_progress":
        return "bg-amber-500 text-white";
      case "closed":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  //Priority Style
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "low":
        return "bg-green-600 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "urgent":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Fetch data
  const fetchTickets = async () => {
    setLoading(true);

    try {
      const params = {};

      //STATUS (all roles)
      if (tab !== "all") {
        params.status = tab; 
      }

      //PRIORITY (apply for all roles)
      if (priority !== "all") {
        params.priority = priority.toLowerCase().trim();
      }

      //DEPARTMENT (only admin & manager)
      if (["admin", "manager"].includes(user.role) && department !== "all") {
        params.department = department;
      }

      console.log("PARAMS SENT:", params);

      // Fetch tickets
      const res = await api.get("/tickets/", { params });

      const data = res.data;
      console.log("API RESPONSE:", data);

      //Safe data handling
      if (Array.isArray(data)) {
        setTickets(data);
      } else if (data.results) {
        setTickets(data.results);
      } else {
        setTickets([]);
      }

      //Fetch departments (only allowed roles)
      if (["admin", "manager", "team_lead"].includes(user.role)) {
        try {
          const deptRes = await api.get("/departments/");
          setDepartments(deptRes.data);
        } catch (err) {
          console.warn("Department fetch failed:", err);
        }
      }

    } catch (err) {
      console.error("Ticket fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [tab, priority, department, location.state]);

  // Status Tabs
  const allTabs  = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "assigned", label: "Assigned" },
    { key: "in_progress", label: "In Progress" },
    { key: "closed", label: "Closed" },
  ];

  const statusTabs = role === "client"
  ? allTabs.filter(tab => tab.key !== "assigned")
  : allTabs;

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Title */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        All Tickets
      </h1>

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center justify-center 
                min-w-[110px] h-[32px] px-3 text-sm font-medium rounded-md capitalize
                transition
                ${
                  tab === t.key
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {/* Department - only show if NOT team lead */}
          {["admin", "manager"].includes(user.role) && (
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Departments</option>
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
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-3"><input type="checkbox" /></th>
              <th className="p-3 text-left">Ticket</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Created</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No tickets found
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >

                  <td className="p-3">
                    <input type="checkbox" />
                  </td>

                  <td className="p-3">
                    <p className="font-semibold">{ticket.title}</p>
                    <p className="text-xs text-gray-500">
                      {ticket.ticket_id}
                    </p>
                  </td>

                  <td className="p-3">
                    {ticket.department?.name || "-"}
                  </td>

                  <td className="p-3">
                    <span className={`${badgeBase} ${getStatusStyle(ticket.status)}`}>
                      {(ticket.status || "-").replace("_", " ")}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className={`${badgeBase} ${getPriorityStyle(ticket.priority)}`}>
                      {ticket.priority || "-"}
                    </span>
                  </td>

                  <td className="p-3 text-sm text-gray-500">
                    {ticket.created_at
                      ? new Date(ticket.created_at).toLocaleDateString()
                      : "-"}
                  </td>

                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllTickets;