import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type UserStatsProps = {
  data: {
    totalUsers: number;
    verifiedUsers: number;
    enabledUsers: number;
  };
};

const UserStats: React.FC<UserStatsProps> = ({ data }) => {
  const chartData = [
    { name: "Total Users", value: data.totalUsers },
    { name: "Verified Users", value: data.verifiedUsers },
    { name: "Enabled Users", value: data.enabledUsers },
  ];

  return (
    <BarChart width={600} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
  );
};

export default UserStats;
