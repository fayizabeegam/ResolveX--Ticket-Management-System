import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ITEMS_PER_PAGE = 6;

const DepartmentDetails = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = user?.role;

  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch department + users + tickets
  const fetchDepartmentData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("authToken");
      const depRes = await api.get(`/departments/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartment(depRes.data);
      const usersRes = await api.get(`/users/?department=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(usersRes.data.results || usersRes.data);
      const ticketsRes = await api.get(`/tickets/?department=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(ticketsRes.data.results || ticketsRes.data);
    } catch (err) {
      console.error(err.response || err.message);
      alert("Failed to fetch department data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, [id]);

  // Pagination
  const paginatedItems = (items) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const totalPages = (items) => Math.ceil(items.length / ITEMS_PER_PAGE);

  if (loading)
    return <div className="text-center py-12 text-gray-500">Loading...</div>;

  if (!department)
    return <div className="text-center py-12 text-red-500">Department not found</div>;

  const roleStyle =
    "inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-md min-w-[100px] h-[26px] bg-blue-600 text-white capitalize";

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
        return "bg-green-400 text-white";
    }
  };

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

  const badgeBase =
  "inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-md min-w-[100px] h-[26px] capitalize";
  return (

    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-100">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {department.name}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">

        {[
          { key: "users", label: `Users (${users.length})` },
          { key: "tickets", label: `Tickets (${tickets.length})` }
        ].map((t) => (

          <button
            key={t.key}
            onClick={() => {
              setActiveTab(t.key);
              setCurrentPage(1);
            }}
            className={`px-4 py-1 rounded-md text-sm transition ${
              activeTab === t.key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>

        ))}

      </div>

      {/* USERS TABLE */}
      {activeTab === "users" && (

        <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-100 text-gray-600 text-sm">

              <tr>
                <th className="p-3"><input type="checkbox" /></th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Joined</th>
              </tr>

            </thead>

            <tbody>

              {paginatedItems(users).length === 0 ? (

                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No users found in this department
                  </td>
                </tr>

              ) : (

                paginatedItems(users).map((user) => (

                  <tr
                    key={user.id}
                    className={`border-t hover:bg-gray-50 ${
                      role !== "manager"
                        ? "cursor-pointer"
                        : "cursor-default opacity-80"
                    }`}
                    onClick={() => {
                      if (role !== "manager") {
                        navigate(`/users/profile/${user.id}`);
                      }
                    }}
                  >

                    {/* Checkbox */}
                    <td className="p-3">
                      <input type="checkbox" />
                    </td>

                    {/* User */}
                    <td className="p-3 flex items-center gap-3">

                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt="avatar"
                          className="w-9 h-9 rounded-full object-cover border"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=random`;
                          }}
                        />
                      ) : (
                        <img
                          src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                          alt="avatar"
                          className="w-9 h-9 rounded-full object-cover border"
                        />
                      )}

                      <div>
                        <p className="font-semibold">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>

                    </td>

                    {/* Role */}
                    <td className="p-3">

                      <span className={roleStyle}>
                        {(user.role || "-").replace("_", " ")}
                      </span>

                    </td>

                    {/* Department */}
                    <td className="p-3">
                      {user.department?.name || "-"}
                    </td>

                    {/* Status */}
                    <td className="p-3">

                      <span
                        className={`px-2 py-1 text-xs rounded-full text-white ${
                          user.is_active
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {user.is_active ? "Active" : "Blocked"}
                      </span>

                    </td>

                    {/* Joined */}
                    <td className="p-3 text-sm text-gray-500">

                      {user.enrolled
                        ? new Date(user.enrolled).toLocaleDateString()
                        : "-"}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      )}

      {/* TICKETS TABLE */}
     
      {activeTab === "tickets" && (

        <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">

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

              {paginatedItems(tickets).length === 0 ? (

                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No tickets found in this department
                  </td>
                </tr>

              ) : (

                paginatedItems(tickets).map((ticket) => (

                  <tr
                    key={ticket.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >

                    {/* Checkbox */}
                    <td className="p-3">
                      <input type="checkbox" />
                    </td>

                    {/* Ticket Title */}
                    <td className="p-3">

                      <div>
                        <p className="font-semibold">{ticket.title}</p>
                        <p className="text-xs text-gray-500">
                          {ticket.created_by?.username || "Unknown"}
                        </p>
                      </div>

                    </td>

                    {/* Department */}
                    <td className="p-3">
                      {ticket.department?.name || department.name}
                    </td>

                    {/* Status */}
                    <td className="p-3">

                      <span className={`${badgeBase} ${getStatusStyle(ticket.status)}`}>
                        {(ticket.status || "-").replace("_"," ")}
                      </span>

                    </td>

                    {/* Priority */}
                    <td className="p-3">

                       <span className={`${badgeBase} ${getPriorityStyle(ticket.priority)}`}>
                        {ticket.priority || "-"}
                      </span>

                    </td>

                    {/* Created */}
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

      )}

      {/* Pagination */}
      {totalPages(activeTab === "users" ? users : tickets) > 1 && (

        <div className="flex justify-center mt-6 gap-2 flex-wrap">

          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {Array.from(
            { length: totalPages(activeTab === "users" ? users : tickets) },
            (_, i) => (

              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-white"
                }`}
              >
                {i + 1}
              </button>

            )
          )}

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  totalPages(activeTab === "users" ? users : tickets)
                )
              )
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={
              currentPage ===
              totalPages(activeTab === "users" ? users : tickets)
            }
          >
            Next
          </button>

        </div>

      )}

    </div>
  );
};

export default DepartmentDetails;