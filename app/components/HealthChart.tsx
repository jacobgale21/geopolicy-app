"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface HealthDataPoint {
  state: string;
  year: number;
  rank: number;
  name: string;
  value: number;
}

interface HealthChartProps {
  data: HealthDataPoint[];
  state: string;
  healthIssue: string;
}

export default function HealthChart({
  data,
  state,
  healthIssue,
}: HealthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {healthIssue} Data for {state}
        </h3>
        <p className="text-sm font-bold text-gray-800 text-center">
          No data available
        </p>
      </div>
    );
  }

  // Sort data by year for proper chart display
  const sortedData = [...data].sort((a, b) => a.year - b.year);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{`Year: ${label}`}</p>
          <p className="text-blue-600">{`Value: ${data.value}%`}</p>
          <p className="text-green-600">{`National Rank: #${data.rank}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {healthIssue} Trends for {state}
          </h3>
          <p className="text-sm font-bold text-gray-800 text-center">
            {sortedData[0]?.year} - {sortedData[sortedData.length - 1]?.year}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Percentage Over Time (Line) */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 text-center mb-4">
              Percentage Over Time
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={sortedData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toString()}
                  />
                  <YAxis
                    label={{
                      value: "Percentage (%)",
                      angle: -90,
                      position: "outsideLeft",
                      offset: -10,
                      dx: -15,
                      style: { textAnchor: "middle" },
                    }}
                    width={50}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    labelFormatter={(value) => `Year: ${value}`}
                    formatter={(value: number) => [`${value}%`, "Value"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontWeight: "600",
                    }}
                    labelStyle={{
                      fontWeight: "700",
                      color: "#374151",
                      fontSize: "14px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Percentage"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: "#10B981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* National Ranking Over Time (Bar) */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 text-center mb-4">
              National Ranking Over Time
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toString()}
                  />
                  <YAxis
                    label={{
                      value: "Rank",
                      angle: -90,
                      position: "outsideLeft",
                      offset: -10,
                      dx: -15,
                      style: { textAnchor: "middle" },
                    }}
                    width={50}
                    tick={{ fontSize: 12 }}
                    domain={["dataMin - 5", "dataMax + 5"]}
                    reversed={true}
                  />
                  <Tooltip
                    labelFormatter={(value) => `Year: ${value}`}
                    formatter={(value: number) => [value, "Rank"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      fontWeight: "600",
                    }}
                    labelStyle={{
                      fontWeight: "700",
                      color: "#374151",
                      fontSize: "14px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="rank"
                    name="Rank"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
        <div className="mt-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Summary Statistics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium text-center">
                Latest Value
              </p>
              <p className="text-2xl font-bold text-green-800 text-center">
                {sortedData[sortedData.length - 1]?.value.toFixed(2)}%
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium text-center">
                Current Rank
              </p>
              <p className="text-2xl font-bold text-blue-800 text-center">
                #{sortedData[sortedData.length - 1]?.rank}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium text-center">
                Best Rank
              </p>
              <p className="text-2xl font-bold text-purple-800 text-center">
                #{Math.min(...sortedData.map((d) => d.rank))}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600 font-medium text-center">
                Trend
              </p>
              <p className="text-2xl font-bold text-orange-800 text-center">
                {sortedData.length > 1
                  ? sortedData[sortedData.length - 1].value >
                    sortedData[0].value
                    ? "↗ " +
                      (
                        sortedData[sortedData.length - 1].value -
                        sortedData[0].value
                      ).toFixed(2) +
                      "%"
                    : "↘ " +
                      (
                        sortedData[0].value -
                        sortedData[sortedData.length - 1].value
                      ).toFixed(2) +
                      "%"
                  : "➡"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
