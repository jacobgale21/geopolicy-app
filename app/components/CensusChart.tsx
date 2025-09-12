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
import { getUsAveragesFromCache, getUsAverages } from "../utils/usCensusCache";

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

  // Merge US averages per year into the dataset for overlay series
  const mergedData = sortedData.map((d) => {
    const us = getUsAveragesFromCache(d.year) ?? getUsAverages(d.year);
    return {
      ...d,
      poverty_rate_us: us?.poverty_rate ?? null,
      educational_us: us?.educational ?? null,
      income_mean_us: us?.income_mean ?? null,
      income_median_us: us?.income_median ?? null,
    };
  });

  return (
    <div>
      <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Census Data Trends for {state}
          </h3>
          <p className="text-sm font-bold text-gray-800 text-center">
            {sortedData[0]?.year} - {sortedData[sortedData.length - 1]?.year}
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Poverty Rate Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 text-center mb-4">
              Poverty Rate Trends
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mergedData}
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
                      position: "outsideLeft",
                      offset: -10,
                      dx: -15, // shift further left
                      style: { textAnchor: "middle" },
                    }}
                    width={50}
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
                  <Line
                    type="monotone"
                    dataKey="poverty_rate_us"
                    name="US Average"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Education Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 text-center mb-4">
              Education Trends
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mergedData}
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
                      position: "outsideLeft",
                      offset: -10,
                      dx: -15, // shift further left
                      style: { textAnchor: "middle" },
                    }}
                    width={50}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    labelFormatter={(value) => `Year: ${value}`}
                    formatter={(value, name) => [
                      `${value}%`,
                      "Education Level",
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
                  <Line
                    type="monotone"
                    dataKey="educational"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ fill: "#059669", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: "#059669", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="educational_us"
                    name="US Average"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mean Income Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 text-center mb-4">
              Mean Income Trends
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mergedData}
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
                      position: "outsideLeft",
                      offset: -10,
                      dx: -25, // shift further left
                      style: { textAnchor: "middle" },
                    }}
                    width={50}
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
                  <Line
                    type="monotone"
                    dataKey="income_mean_us"
                    name="US Average"
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Median Income Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 text-center mb-4">
              Median Income Trends
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mergedData}
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
                      position: "outsideLeft",
                      offset: 0,
                      dx: -25, // shift further left
                      style: { textAnchor: "middle" }, // keeps it centered nicely
                    }}
                    width={50}
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
                  <Line
                    type="monotone"
                    dataKey="income_median_us"
                    name="US Average"
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      {/* State Summary Statistics */}
      <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
        <div className="mt-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Summary Statistics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium text-center">
                Poverty Rate
              </p>
              <p className="text-2xl font-bold text-red-800 text-center">
                {sortedData[sortedData.length - 1]?.poverty_rate?.toFixed(1)}%
              </p>
              <p className="text-xs text-red-600 text-center">
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
              <p className="text-sm text-green-600 font-medium text-center">
                Education
              </p>
              <p className="text-2xl font-bold text-green-800 text-center">
                {sortedData[sortedData.length - 1]?.educational?.toFixed(1)}%
              </p>
              <p className="text-xs text-green-600 text-center">
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
              <p className="text-sm text-blue-600 font-medium text-center">
                Mean Income
              </p>
              <p className="text-2xl font-bold text-blue-800 text-center">
                $
                {(
                  sortedData[sortedData.length - 1]?.income_mean / 1000
                ).toFixed(0)}
                k
              </p>
              <p className="text-xs text-blue-600 text-center">
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
              <p className="text-sm text-purple-600 font-medium text-center">
                Median Income
              </p>
              <p className="text-2xl font-bold text-purple-800 text-center">
                $
                {(
                  sortedData[sortedData.length - 1]?.income_median / 1000
                ).toFixed(0)}
                k
              </p>
              <p className="text-xs text-purple-600 text-center">
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

        {/* State vs National Comparison */}
        <div className="mt-4 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Poverty Rate Comparison */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600 font-medium text-center">
                Poverty Rate Change
              </p>
              <p className="text-2xl font-bold text-orange-800 text-center">
                {sortedData.length > 1
                  ? (() => {
                      const stateChange =
                        sortedData[sortedData.length - 1]?.poverty_rate -
                        sortedData[0]?.poverty_rate;
                      const usFirst =
                        getUsAveragesFromCache(sortedData[0]?.year) ??
                        getUsAverages(sortedData[0]?.year);
                      const usLast =
                        getUsAveragesFromCache(
                          sortedData[sortedData.length - 1]?.year
                        ) ??
                        getUsAverages(sortedData[sortedData.length - 1]?.year);
                      const usChange =
                        (usLast?.poverty_rate ?? 0) -
                        (usFirst?.poverty_rate ?? 0);
                      const difference = stateChange - usChange;
                      return `${difference > 0 ? "+" : ""}${difference.toFixed(1)}%`;
                    })()
                  : "N/A"}
              </p>
              <p className="text-xs text-orange-600 text-center">
                vs National Change
              </p>
            </div>

            {/* Education Comparison */}
            <div className="bg-teal-50 p-4 rounded-lg">
              <p className="text-sm text-teal-600 font-medium text-center">
                Education Change
              </p>
              <p className="text-2xl font-bold text-teal-800 text-center">
                {sortedData.length > 1
                  ? (() => {
                      const stateChange =
                        sortedData[sortedData.length - 1]?.educational -
                        sortedData[0]?.educational;
                      const usFirst =
                        getUsAveragesFromCache(sortedData[0]?.year) ??
                        getUsAverages(sortedData[0]?.year);
                      const usLast =
                        getUsAveragesFromCache(
                          sortedData[sortedData.length - 1]?.year
                        ) ??
                        getUsAverages(sortedData[sortedData.length - 1]?.year);
                      const usChange =
                        (usLast?.educational ?? 0) -
                        (usFirst?.educational ?? 0);
                      const difference = stateChange - usChange;
                      return `${difference > 0 ? "+" : ""}${difference.toFixed(1)}%`;
                    })()
                  : "N/A"}
              </p>
              <p className="text-xs text-teal-600 text-center">
                vs National Change
              </p>
            </div>

            {/* Mean Income Comparison */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-indigo-600 font-medium text-center">
                Mean Income Change
              </p>
              <p className="text-2xl font-bold text-indigo-800 text-center">
                {sortedData.length > 1
                  ? (() => {
                      const stateChange =
                        (sortedData[sortedData.length - 1]?.income_mean -
                          sortedData[0]?.income_mean) /
                        sortedData[0]?.income_mean;
                      const usFirst =
                        getUsAveragesFromCache(sortedData[0]?.year) ??
                        getUsAverages(sortedData[0]?.year);
                      const usLast =
                        getUsAveragesFromCache(
                          sortedData[sortedData.length - 1]?.year
                        ) ??
                        getUsAverages(sortedData[sortedData.length - 1]?.year);
                      const usChange =
                        ((usLast?.income_mean ?? 0) -
                          (usFirst?.income_mean ?? 0)) /
                        (usFirst?.income_mean ?? 0);
                      const difference = stateChange - usChange;
                      return `${difference > 0 ? "+" : ""}${(difference * 100).toFixed(2)}%`;
                    })()
                  : "N/A"}
              </p>
              <p className="text-xs text-indigo-600 text-center">
                vs National Change
              </p>
            </div>

            {/* Median Income Comparison */}
            <div className="bg-violet-50 p-4 rounded-lg">
              <p className="text-sm text-violet-600 font-medium text-center">
                Median Income Change
              </p>
              <p className="text-2xl font-bold text-violet-800 text-center">
                {sortedData.length > 1
                  ? (() => {
                      const stateChange =
                        (sortedData[sortedData.length - 1]?.income_median -
                          sortedData[0]?.income_median) /
                        sortedData[0]?.income_median;
                      const usFirst =
                        getUsAveragesFromCache(sortedData[0]?.year) ??
                        getUsAverages(sortedData[0]?.year);
                      const usLast =
                        getUsAveragesFromCache(
                          sortedData[sortedData.length - 1]?.year
                        ) ??
                        getUsAverages(sortedData[sortedData.length - 1]?.year);
                      const usChange =
                        ((usLast?.income_median ?? 0) -
                          (usFirst?.income_median ?? 0)) /
                        (usFirst?.income_median ?? 0);
                      const difference = stateChange - usChange;
                      return `${difference > 0 ? "+" : ""}${(difference * 100).toFixed(2)}%`;
                    })()
                  : "N/A"}
              </p>
              <p className="text-xs text-violet-600 text-center">
                vs National Change
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
