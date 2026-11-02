"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Users,
  Activity,
  HeartPulse,
  CalendarDays,
  FileText,
  ShieldCheck,
} from "lucide-react";

const statData = [
  {
    title: "Total Babies Screened",
    count: 3361,
    percentage: 6.5,
    isPositive: true,
    icon: <Users className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Positive Cases",
    count: 1616,
    percentage: 3.2,
    isPositive: true,
    icon: <Activity className="h-6 w-6 text-red-500" />,
  },
  {
    title: "Borderline Cases",
    count: 123,
    percentage: 2.1,
    isPositive: true,
    icon: <HeartPulse className="h-6 w-6 text-yellow-500" />,
  },
  {
    title: "Pending Follow Ups",
    count: 98,
    percentage: 1.5,
    isPositive: true,
    icon: <CalendarDays className="h-6 w-6 text-green-500" />,
  },
  {
    title: "Deceased",
    count: 87,
    percentage: 0.9,
    isPositive: false,
    icon: <FileText className="h-6 w-6 text-purple-500" />,
  },
  {
    title: "Pending Results",
    count: 217,
    percentage: 1.8,
    isPositive: true,
    icon: <ShieldCheck className="h-6 w-6 text-indigo-500" />,
  },
  
];

const yearlyData = {
  2023: [
    { month: "Jan", New: 120, Old: 70 },
    { month: "Feb", New: 200, Old: 100 },
    { month: "Mar", New: 150, Old: 80 },
    { month: "Apr", New: 180, Old: 60 },
    { month: "May", New: 170, Old: 75 },
    { month: "Jun", New: 130, Old: 55 },
    { month: "Jul", New: 160, Old: 60 },
    { month: "Aug", New: 90, Old: 40 },
    { month: "Sep", New: 110, Old: 50 },
    { month: "Oct", New: 210, Old: 90 },
    { month: "Nov", New: 180, Old: 70 },
    { month: "Dec", New: 95, Old: 45 },
  ],
  2024: [
    { month: "Jan", New: 150, Old: 80 },
    { month: "Feb", New: 350, Old: 120 },
    { month: "Mar", New: 180, Old: 90 },
    { month: "Apr", New: 280, Old: 70 },
    { month: "May", New: 160, Old: 85 },
    { month: "Jun", New: 170, Old: 88 },
    { month: "Jul", New: 270, Old: 78 },
    { month: "Aug", New: 90, Old: 40 },
    { month: "Sep", New: 190, Old: 60 },
    { month: "Oct", New: 360, Old: 100 },
    { month: "Nov", New: 250, Old: 110 },
    { month: "Dec", New: 85, Old: 45 },
  ],
};

const StatCard = ({ icon, title, count, percentage, isPositive }) => (
  <div className="flex-1 min-w-[230px] bg-white p-5 rounded-xl shadow border">
    <div className="flex justify-between items-center mb-3">
      <div className="bg-gray-100 p-2 rounded-md">{icon}</div>
      <span
        className={`text-sm font-medium px-2 py-1 rounded-full ${
          isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {isPositive ? "↑" : "↓"} {percentage}%
      </span>
    </div>
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className="text-2xl font-bold">{count.toLocaleString()}</h2>
  </div>
);

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState("2024");

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-800">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-8">
        {statData.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div>
            <h2 className="text-xl font-semibold mb-1">Monthly Patients</h2>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm bg-white shadow-sm focus:outline-none"
          >
            {Object.keys(yearlyData).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData[selectedYear]}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="month" stroke="#999" fontSize={12} />
              <YAxis stroke="#999" fontSize={12} />
              <Tooltip />
              <Bar
                dataKey="New"
                fill="#60A5FA"
                barSize={18}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Old"
                fill="#A78BFA"
                barSize={18}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full flex justify-center gap-6 text-sm mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-blue-400" />
            <span>New Patients</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-purple-400" />
            <span>Old Patients</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
