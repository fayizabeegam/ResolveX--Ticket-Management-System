import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../api/axios";

const StatusChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("dashboard/status/")
      .then(res => {
        const formatted = res.data.map(item => ({
          name: item.status.replace("_", " "),
          value: item.count
        }));
        setData(formatted);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow w-full h-72 sm:h-80 md:h-96">
      <h3 className="font-semibold mb-4 text-lg sm:text-xl">Ticket Status</h3>

      {loading ? (
        <p className="text-gray-500">Loading chart...</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default StatusChart;