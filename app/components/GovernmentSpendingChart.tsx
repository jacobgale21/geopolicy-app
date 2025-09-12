"use client";
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface SpendingData {
  name: string;
  amount: number;
  percent_budget: number;
}

interface GovernmentSpendingData {
  agency_data: SpendingData[];
  budget_functions_data: SpendingData[];
}

interface GovernmentSpendingChartProps {
  data: GovernmentSpendingData;
}

// Color palette for charts
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#ff00ff",
  "#00ffff",
  "#ff0000",
  "#0000ff",
  "#ffff00",
  "#ffa500",
  "#800080",
  "#008000",
  "#ff69b4",
  "#40e0d0",
  "#ee82ee",
  "#90ee90",
  "#f0e68c",
  "#dda0dd",
  "#98fb98",
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercentage = (percentage: number) => {
  return `${percentage.toFixed(2)}%`;
};

export default function GovernmentSpendingChart({
  data,
}: GovernmentSpendingChartProps) {
  const [activeTab, setActiveTab] = useState<"agencies" | "budget_functions">(
    "agencies"
  );

  if (
    !data ||
    (!data.agency_data?.length && !data.budget_functions_data?.length)
  ) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Government Spending Data
        </h2>
        <p className="text-gray-600 text-center">No spending data available</p>
      </div>
    );
  }

  const currentData =
    activeTab === "agencies" ? data.agency_data : data.budget_functions_data;
  const title =
    activeTab === "agencies"
      ? "Federal Agency Spending"
      : "Budget Functions Spending";

  // Sort data by percentage and take top 15, group the rest as "Other"

  const top15Data = currentData.slice(0, 15);
  const otherData = currentData.slice(15);

  // Calculate "Other" group if there are remaining agencies
  let processedData = [...top15Data];
  if (otherData.length > 0) {
    const otherTotal = otherData.reduce((sum, item) => sum + item.amount, 0);
    const otherPercentage = otherData.reduce(
      (sum, item) => sum + item.percent_budget,
      0
    );
    processedData.push({
      name: "Other",
      amount: otherTotal,
      percent_budget: otherPercentage,
    });
  }

  // Prepare chart data with colors
  const chartData = processedData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  // Calculate total spending
  const totalSpending = currentData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Where is your Money Going?
        </h2>
        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setActiveTab("agencies")}
            className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg ${
              activeTab === "agencies"
                ? "bg-purple-600 text-white border-purple-600"
                : "text-gray-700 hover:bg-gray-50 bg-white"
            }`}
          >
            Federal Agencies
          </button>
          <button
            onClick={() => setActiveTab("budget_functions")}
            className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg ${
              activeTab === "budget_functions"
                ? "bg-purple-600 text-white border-purple-600"
                : "text-gray-700 hover:bg-gray-50 bg-white"
            }`}
          >
            Budget Functions
          </button>
        </div>

        <div className="space-y-10">
          {/* Pie Chart */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              {title} Distribution
            </h3>
            <div className="h-[525px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    //   label={({ percent }) => `${(percent || 0).toFixed(1)}%`}
                    outerRadius={180}
                    fill="#8884d8"
                    dataKey="percent_budget"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${props.payload.name}: ${value.toFixed(1)}%`,
                    ]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontSize: "14px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                      fontSize: "14px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto mb-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-800 text-center">
            {title} by Amount
          </h3>
          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.slice(0, 10)} // Show top 10 items
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 120,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => `$${(value / 1e12).toFixed(1)}T`}
                  tick={{ fontSize: 14 }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Amount",
                  ]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontSize: "14px",
                  }}
                />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Total Spending
            </h4>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalSpending)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Largest Share
            </h4>
            <p className="text-lg font-bold text-gray-900">
              {processedData[0]?.name}
            </p>
            <p className="text-sm text-gray-600">
              {formatPercentage(processedData[0]?.percent_budget || 0)}
            </p>
          </div>
        </div>

        {/* Top 5 List */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Top 5 {activeTab === "agencies" ? "Agencies" : "Budget Functions"}
          </h4>
          <div className="space-y-2">
            {processedData.slice(0, 5).map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatPercentage(item.percent_budget)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
