import { useEffect, useState } from "react";
import api from "../api/axios";

import DashboardLayout from "../layout/DashboardLayout";
import StatCard from "../components/StatCard";
import StatusChart from "../charts/StatusChart";
import DepartmentChart from "../charts/DepartmentChart";
import EmployeePerformanceChart from "../charts/EmployeePerformanceChart";
import WeeklyTicketsChart from "../charts/WeeklyTicketChart";


const Dashboard = () => {

  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = user?.role;
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("dashboard/stats/")
      .then(res => setStats(res.data.stats))
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className=" bg-gray-100 min-h-screen flex">

      <div className="flex-1 p-6">

        {/* Stats cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">

          {(role === "admin" || role === "manager") && (
            <>
              <StatCard title="Total Users" value={stats.total_users} />
              <StatCard title="Departments" value={stats.departments} />
              <StatCard title="Tickets" value={stats.tickets} />
              <StatCard title="Completed" value={stats.completed} />
            </>
          )}

          {role === "team_lead" && (
            <>
              <StatCard title="Department Users" value={stats.total_users} />
              <StatCard title="Tickets" value={stats.tickets} />
              <StatCard title="Overdue" value={stats.overdue} />
              <StatCard title="Completed" value={stats.completed} />
            </>
          )}

          {role === "employee" && (
            <>
              <StatCard title="My Tickets" value={stats.my_tickets} />
              <StatCard title="Open" value={stats.open} />
              <StatCard title="Closed" value={stats.closed} />
              <StatCard title="Overdue" value={stats.overdue} />
            </>
          )}

          {role === "client" && (
            <>
              <StatCard title="My Tickets" value={stats.my_tickets || 0} />
              <StatCard title="Open" value={stats.open || 0} />
              <StatCard title="Closed" value={stats.closed || 0} />
              <StatCard title="Overdue" value={stats.overdue || 0} />
            </>
          )}

        </div>

        {/* Charts */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(role === "admin" || role === "manager") && (
          <StatusChart />
          )}
          
          {(role === "admin" || role === "manager") && (
            <DepartmentChart />
          )}

        </div>

        
        <div className="mt-6 w-full">
            <WeeklyTicketsChart />
        </div>
        

        {/* Employee Performance (FULL WIDTH BELOW) */}
          {(role === "admin" || role === "manager" || role === "team_lead") && (
            <div className=" mt-6 w-full">
              <EmployeePerformanceChart />
            </div>
          )}

      </div>

    </div>
    </DashboardLayout>
    

  );

};

export default Dashboard;