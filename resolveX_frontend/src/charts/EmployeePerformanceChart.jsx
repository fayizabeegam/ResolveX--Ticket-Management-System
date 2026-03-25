import { useEffect, useState } from "react";
import api from "../api/axios";

const EmployeePerformanceChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/dashboard/employee/")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="bg-white shadow rounded-xl p-6">

      <h2 className="text-lg font-semibold mb-5 text-gray-800">
        🏆 Employee Leaderboard
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No performance data</p>
      ) : (
        <div className="space-y-3">

          {data.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg border
              ${index === 0 ? "bg-yellow-50 border-yellow-300" : ""}
              ${index === 1 ? "bg-gray-50 border-gray-300" : ""}
              ${index === 2 ? "bg-orange-50 border-orange-300" : ""}
              hover:shadow-sm transition`}
            >

              {/* LEFT */}
              <div className="flex items-center gap-3">

                {/* Rank */}
                <div className="text-lg font-bold w-6 text-center">
                  {index + 1}
                </div>

                {/* Avatar */}
                <img
                  src={
                    user.avatar
                      ? user.avatar
                      : `https://ui-avatars.com/api/?name=${user.employee}`
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border"
                />

                {/* Name */}
                <div>
                  <p className="font-medium text-gray-800">
                    {user.employee}
                  </p>
                  <p className="text-xs text-gray-500">
                    Resolved Tickets
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-600">
                  {user.resolved}
                </p>
              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default EmployeePerformanceChart;