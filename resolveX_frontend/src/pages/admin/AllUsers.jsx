import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const AllUsers = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = user?.role;

  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("users/");
        const data = res.data.results || res.data;
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);


  // Filter users
  const filtered = users.filter((u) => {
    if (role === "manager" && (u.role || "").toLowerCase() === "manager") {
    return false;
    }
    const roleMatch =
      tab === "all" ? true : (u.role || "").toLowerCase() === tab;
    const searchMatch =
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    return roleMatch && searchMatch;
  });


  // Role badge style
  const roleStyle =
    "inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-md min-w-[100px] h-[26px] bg-blue-600 text-white capitalize";


  return (

    <div className="p-6 max-w-7xl mx-auto">

      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        All Users
      </h1>

      {/* Top bar */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">

          {["all","manager","team_lead","employee","client"]
          .filter((t) => t != role)
          .map((t) => (

            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1 rounded-md text-sm capitalize transition ${
                tab === t
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {t === "all" ? "View All" : t.replace("_"," ")}
            </button>

          ))}

        </div>


        {/* Search */}
        <input
          type="text"
          placeholder="Search user..."
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={(e)=>setSearch(e.target.value)}
        />

      </div>


      {/* Table */}
      <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100 text-gray-600 text-sm">

            <tr>
              <th className="p-3"><input type="checkbox"/></th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Joined</th>
            </tr>

          </thead>


          <tbody>

            {loading ? (

              <tr>
                <td colSpan="6" className="text-center py-6">
                  Loading users...
                </td>
              </tr>

            ) : filtered.length === 0 ? (

              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No users found
                </td>
              </tr>

            ) : (

              filtered.map((user) => (

                <tr
                  key={user.id}
                  className={`border-t hover:bg-gray-50 ${
                    role === "manager" || role === "team_lead"
                      ? "cursor-pointer"
                      : "cursor-default opacity-80"
                  }`}
                  onClick={() => {
                    if (role == "admin") {
                      navigate(`/users/profile/${user.id}`);
                    }
                  }}
                >

                  <td className="p-3">
                    <input type="checkbox"/>
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
                      {(user.role || "-").replace("_"," ")}
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

    </div>

  );

};

export default AllUsers;