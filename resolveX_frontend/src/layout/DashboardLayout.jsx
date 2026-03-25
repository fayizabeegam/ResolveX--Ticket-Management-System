import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const DashboardLayout = ({ children }) => {

  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = user?.role;
  console.log("USER:", user);
  console.log("ROLE:", role);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Area */}
      <div className="flex-1 md:ml-64 flex flex-col">

        {/* Topbar */}
        <Topbar setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 flex-1">
          {children}
        </main>

      </div>

    </div>

  );
};

export default DashboardLayout;