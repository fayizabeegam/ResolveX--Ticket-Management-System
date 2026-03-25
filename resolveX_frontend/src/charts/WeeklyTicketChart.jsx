import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import api from "../api/axios";

const WeeklyTicketsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("dashboard/weekly-tickets/")
      .then(res => {
        const formatted = Object.entries(res.data).map(([day, value]) => ({
          day,
          tickets: value
        }));
        setData(formatted);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow w-full h-72 sm:h-80 md:h-96 mt-6">
      <h3 className="font-semibold mb-4 text-lg sm:text-xl">Weekly Tickets</h3>

      {loading ? (
        <p className="text-gray-500">Loading chart...</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 60]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="tickets"
              stroke="#6366f1"
              fill="#c7d2fe"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default WeeklyTicketsChart;