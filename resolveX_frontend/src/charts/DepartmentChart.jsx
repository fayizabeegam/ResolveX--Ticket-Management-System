import { useEffect, useState } from "react";
import api from "../api/axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

const DepartmentChart = () => {

  const [data, setData] = useState([]);

  useEffect(() => {

    api.get("dashboard/department/")
      .then(res => {

        const formatted = res.data.map(item => ({
          name: item.department,
          value: item.count
        }));

        setData(formatted);

      })
      .catch(err => console.log(err));

  }, []);

  return (

    <div className="bg-white p-4 rounded-lg shadow">

      <h3 className="font-semibold mb-3">
        Department Tickets
      </h3>

      <ResponsiveContainer width="100%" height={250}>

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >

            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}

          </Pie>

          <Tooltip />

        </PieChart>

      </ResponsiveContainer>

    </div>

  );

};

export default DepartmentChart;