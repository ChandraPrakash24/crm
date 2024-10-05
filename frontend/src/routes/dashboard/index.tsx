// src/DashboardPage.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUsers,
  FaEnvelopeOpenText,
  FaEnvelope,
  FaCheckCircle,
  FaShieldAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface SummaryData {
  totalUsers: number;
  verifiedEmails: {
    count: number;
    percentage: string;
  };
  unverifiedEmails: {
    count: number;
    percentage: string;
  };
  enabledAccounts: {
    count: number;
    percentage: string;
  };
  totpEnabled: {
    count: number;
    percentage: string;
  };
  usersNeedingVerification: number;
}

export const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("https://admin2-dash.zata.ai/api/dashboard")
      // .get("https://admin2-dash.zata.ai/api/dashboard")
      .then((response) => {
        // console.log(response.data);
        setDashboardData(response.data.summary); // Correctly access 'summary'
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return null; // Or some fallback UI
  }

  const metrics = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers,
      icon: <FaUsers className="h-6 w-6 text-blue-500" />,
      bgColor: "bg-blue-100",
      textColor: "text-blue-500",
    },
    {
      title: "Verified Emails",
      value: `${dashboardData.verifiedEmails.count} (${dashboardData.verifiedEmails.percentage})`,
      icon: <FaEnvelopeOpenText className="h-6 w-6 text-green-500" />,
      bgColor: "bg-green-100",
      textColor: "text-green-500",
    },
    {
      title: "Unverified Emails",
      value: `${dashboardData.unverifiedEmails.count} (${dashboardData.unverifiedEmails.percentage})`,
      icon: <FaEnvelope className="h-6 w-6 text-red-500" />,
      bgColor: "bg-red-100",
      textColor: "text-red-500",
    },
    {
      title: "Enabled Accounts",
      value: `${dashboardData.enabledAccounts.count} (${dashboardData.enabledAccounts.percentage})`,
      icon: <FaCheckCircle className="h-6 w-6 text-green-500" />,
      bgColor: "bg-green-100",
      textColor: "text-green-500",
    },
    {
      title: "TOTP Enabled",
      value: `${dashboardData.totpEnabled.count} (${dashboardData.totpEnabled.percentage})`,
      icon: <FaShieldAlt className="h-6 w-6 text-yellow-500" />,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-500",
    },
    {
      title: "Users Needing Verification",
      value: dashboardData.usersNeedingVerification,
      icon: <FaExclamationCircle className="h-6 w-6 text-orange-500" />,
      bgColor: "bg-orange-100",
      textColor: "text-orange-500",
    },
  ];

  // Data for Pie Chart (Email Verification)
  const emailVerificationData = [
    { name: "Verified Emails", value: dashboardData.verifiedEmails.count },
    { name: "Unverified Emails", value: dashboardData.unverifiedEmails.count },
  ];

  const COLORS = ["#34D399", "#F87171"]; // Green and Red

  // Data for Bar Chart (Enabled Accounts vs Users Needing Verification)
  const barChartData = [
    { name: "Enabled Accounts", value: dashboardData.enabledAccounts.count },
    {
      name: "Users Needing Verification",
      value: dashboardData.usersNeedingVerification,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        User Management Dashboard
      </h1>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="flex items-center bg-white shadow rounded-lg p-6 transform hover:scale-105 transition-transform duration-200"
          >
            <div className={`${metric.bgColor} p-3 rounded-full mr-4`}>
              {metric.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                {metric.title}
              </p>
              <p className={`text-xl font-semibold ${metric.textColor}`}>
                {metric.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Graphs Section */}
      <div className="mt-10">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
          {/* Pie Chart: Email Verification Status */}
          <div className="bg-white shadow rounded-lg p-6 flex-1">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Email Verification Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emailVerificationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {emailVerificationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart: Enabled Accounts vs Users Needing Verification */}
          <div className="bg-white shadow rounded-lg p-6 flex-1">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Account Status Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
