import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaTicketAlt,
  FaChartBar,
  FaTimes
} from "react-icons/fa";

const Sidebar = ({ role: rawRole, isOpen, setIsOpen }) => {
  const role = rawRole?.toLowerCase().trim();
  console.log("SIDEBAR ROLE:", role);
  return (
    <>
      {/* Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:fixed
        top-0 left-0
        h-screen w-64
        bg-indigo-900 text-white
        px-6 py-6
        transform transition-transform duration-300
        z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      >

        {/* Close button (Mobile) */}
        <div className="flex justify-between items-center mb-10 md:hidden">
          <h2 className="text-xl font-bold">ResolveX</h2>
          <FaTimes
            className="cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </div>

        {/* Logo */}
        <div className="hidden md:flex items-center gap-2 mb-10">
          <FaTicketAlt className="text-2xl" />
          <h2 className="text-2xl font-bold">ResolveX</h2>
        </div>

        <ul className="space-y-4">

          <li>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 hover:bg-indigo-700 p-2 rounded"
            >
              <FaTachometerAlt />
              Dashboard
            </Link>
          </li>

          {(role === "admin" || role === "manager") && (
            <>
              <li>
                <Link
                  to={role === "admin" ? "/departments" : "/departments/all"}
                  className="flex items-center gap-3 hover:bg-indigo-700 p-2 rounded"
                >
                  <FaBuilding />
                  Departments
                </Link>
              </li>
              
              <li>
                <Link
                  to={role === "admin" ? "/users" : "/users/all"}
                  className="flex items-center gap-3 hover:bg-indigo-700 p-2 rounded"
                >
                  <FaUsers />
                  Users
                </Link>
              </li>      

              <li>
                <Link
                  to="/tickets"
                  className="flex items-center gap-3 hover:bg-indigo-700 p-2 rounded"
                >
                  <FaTicketAlt />
                  Tickets
                </Link>
              </li>

              <li>
                <Link
                  to="/reports"
                  className="flex items-center gap-3 hover:bg-indigo-700 p-2 rounded"
                >
                  <FaChartBar />
                  Reports
                </Link>
              </li>
            </>
          )}
          
          {role === "team_lead"&& (
            <>
              <li>
                <Link
                  to="/users/all"
                  className="flex items-center gap-3 hover:bg-indigo-700 p-2 rounded"
                >
                  <FaUsers />
                  Users
                </Link>
              </li>

              <li>
                <Link
                  to="/tickets"
                  className="flex items-center gap-3 hover:bg-indigo-700 p-2 rounded"
                >
                  <FaTicketAlt />
                  Tickets
                </Link>
              </li>

              <li>
                <Link
                  to="/reports"
                  className="flex items-center gap-3 hover:bg-indigo-700 p-2 rounded"
                >
                  <FaChartBar />
                  Reports
                </Link>
              </li>
            </>
          )}

          {role === "employee" && (
            <>
              <li>
                <Link
                  to="/tickets/all"
                  className="flex items-center gap-3 hover:bg-indigo-700 p-2 rounded"
                >
                  <FaTicketAlt />
                  My Tickets
                </Link>
              </li>

              <li>
                <Link
                  to="/reports"
                  className="flex items-center gap-3 hover:bg-indigo-700 p-2 rounded"
                >
                  <FaChartBar />
                  Reports
                </Link>
              </li>
            </>
          )}

          {role === "client" && (
            <>
              <li>
                <Link
                  to="/tickets" 
                  className="flex items-center gap-3 hover:bg-indigo-700 p-2 rounded"
                >
                  <FaTicketAlt />
                  Tickets
                </Link>
                
              </li>
              
            </>
          )}

        </ul>
      </div>
    </>
  );
};

export default Sidebar;