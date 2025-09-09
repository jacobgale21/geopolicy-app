"use client";
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

interface CensusDataPoint {
  year: number;
  poverty_rate: number;
  educational: number;
  income_mean: number;
  income_median: number;
}

interface CensusChartProps {
  data: CensusDataPoint[];
  state: string;
}

export default function CensusChart({ data, state }: CensusChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Census Data for {state}
        </h3>
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  // Sort data by year to ensure proper chronological order
  const sortedData = [...data].sort((a, b) => a.year - b.year);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Census Data Trends for {state}
        </h3>
        <p className="text-sm text-gray-600">
          Data points: {data.length} years ({sortedData[0]?.year} -{" "}
          {sortedData[sortedData.length - 1]?.year})
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Poverty Rate Chart */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 text-center">
            Poverty Rate Trends
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sortedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis
                  label={{
                    value: "Poverty Rate (%)",
                    angle: -90,
                    position: "insideMiddle",
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  labelFormatter={(value) => `Year: ${value}`}
                  formatter={(value, name) => [`${value}%`, "Poverty Rate"]}
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
                  dataKey="poverty_rate"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ fill: "#dc2626", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "#dc2626", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Education Chart */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 text-center">
            Education Trends
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sortedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis
                  label={{
                    value: "Education Level (%)",
                    angle: -90,
                    position: "insideMiddle",
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  labelFormatter={(value) => `Year: ${value}`}
                  formatter={(value, name) => [`${value}%`, "Education Level"]}
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
                  dataKey="educational"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ fill: "#059669", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "#059669", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mean Income Chart */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 text-center">
            Mean Income Trends
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis
                  label={{
                    value: "Mean Income ($)",
                    angle: -90,
                    position: "insideMiddle",
                  }}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  labelFormatter={(value) => `Year: ${value}`}
                  formatter={(value, name) => [
                    `$${value.toLocaleString()}`,
                    "Mean Income",
                  ]}
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
                  dataKey="income_mean"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Median Income Chart */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 text-center">
            Median Income Trends
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis
                  label={{
                    value: "Median Income ($)",
                    angle: -90,
                    position: "insideMiddle",
                  }}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  labelFormatter={(value) => `Year: ${value}`}
                  formatter={(value, name) => [
                    `$${value.toLocaleString()}`,
                    "Median Income",
                  ]}
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
                  dataKey="income_median"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Summary Statistics
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Poverty Rate</p>
            <p className="text-2xl font-bold text-red-800">
              {sortedData[sortedData.length - 1]?.poverty_rate?.toFixed(1)}%
            </p>
            <p className="text-xs text-red-600">
              {sortedData.length > 1 && (
                <>
                  {sortedData[sortedData.length - 1]?.poverty_rate >
                  sortedData[0]?.poverty_rate
                    ? "↗"
                    : "↘"}
                  {Math.abs(
                    sortedData[sortedData.length - 1]?.poverty_rate -
                      sortedData[0]?.poverty_rate
                  ).toFixed(1)}
                  % vs {sortedData[0]?.year}
                </>
              )}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Education</p>
            <p className="text-2xl font-bold text-green-800">
              {sortedData[sortedData.length - 1]?.educational?.toFixed(1)}%
            </p>
            <p className="text-xs text-green-600">
              {sortedData.length > 1 && (
                <>
                  {sortedData[sortedData.length - 1]?.educational >
                  sortedData[0]?.educational
                    ? "↗"
                    : "↘"}
                  {Math.abs(
                    sortedData[sortedData.length - 1]?.educational -
                      sortedData[0]?.educational
                  ).toFixed(1)}
                  % vs {sortedData[0]?.year}
                </>
              )}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Mean Income</p>
            <p className="text-2xl font-bold text-blue-800">
              $
              {(sortedData[sortedData.length - 1]?.income_mean / 1000).toFixed(
                0
              )}
              k
            </p>
            <p className="text-xs text-blue-600">
              {sortedData.length > 1 && (
                <>
                  {sortedData[sortedData.length - 1]?.income_mean >
                  sortedData[0]?.income_mean
                    ? "↗"
                    : "↘"}
                  $
                  {Math.abs(
                    sortedData[sortedData.length - 1]?.income_mean -
                      sortedData[0]?.income_mean
                  ).toLocaleString()}{" "}
                  vs {sortedData[0]?.year}
                </>
              )}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Median Income</p>
            <p className="text-2xl font-bold text-purple-800">
              $
              {(
                sortedData[sortedData.length - 1]?.income_median / 1000
              ).toFixed(0)}
              k
            </p>
            <p className="text-xs text-purple-600">
              {sortedData.length > 1 && (
                <>
                  {sortedData[sortedData.length - 1]?.income_median >
                  sortedData[0]?.income_median
                    ? "↗"
                    : "↘"}
                  $
                  {Math.abs(
                    sortedData[sortedData.length - 1]?.income_median -
                      sortedData[0]?.income_median
                  ).toLocaleString()}{" "}
                  vs {sortedData[0]?.year}
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
