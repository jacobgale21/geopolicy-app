"use client";
import React, { useMemo, useState } from "react";
import usData from "../utils/us_census_data.json";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CrimeDataPoint {
  year: string;
  crime_counts: number;
}

interface CrimeChartProps {
  // Backward compatible single-series props
  data: CrimeDataPoint[];
  state: string;
  crimeType: string;
  // Optional multi-series props for tabs
  homicideData?: CrimeDataPoint[];
  assaultData?: CrimeDataPoint[];
}

export default function CrimeChart({
  data,
  state,
  crimeType,
  homicideData,
  assaultData,
}: CrimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {crimeType} Data for {state}
        </h3>
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }
  // Determine available datasets (tabs)
  const availableDatasets = useMemo(() => {
    const entries: { type: string; data: CrimeDataPoint[] }[] = [];
    if (homicideData && homicideData.length > 0)
      entries.push({ type: "Homicide", data: homicideData });
    if (assaultData && assaultData.length > 0)
      entries.push({ type: "Assault", data: assaultData });
    // Fallback to single provided data
    if (entries.length === 0 && data && data.length > 0)
      entries.push({ type: crimeType, data });
    return entries;
  }, [homicideData, assaultData, data, crimeType]);

  const [selectedType, setSelectedType] = useState<string>(
    availableDatasets[0]?.type || crimeType
  );

  const current = useMemo(() => {
    const found = availableDatasets.find((d) => d.type === selectedType);
    return found?.data ?? data;
  }, [availableDatasets, selectedType, data]);

  const rate = selectedType.toLowerCase() !== "homicide";

  // Transform data for Recharts and merge national assault rates from cache when available
  const chartData = current.map((item) => {
    const yearKey = String(item.year);
    const nationalAssault = (usData as Record<string, any>)[yearKey]?.assault;
    return {
      year: item.year,
      count: item.crime_counts,
      us_assault: typeof nationalAssault === "number" ? nationalAssault : null,
    };
  });

  return (
    <div>
      {/* Tabs above the box */}
      {availableDatasets.length > 1 && (
        <div className="flex justify-end">
          <div className="inline-flex border border-b-0 border-gray-200 bg-white overflow-hidden">
            {availableDatasets.map((d, i) => (
              <React.Fragment key={d.type}>
                {i > 0 && <div className="w-px self-stretch bg-gray-200" />}
                <button
                  onClick={() => setSelectedType(d.type)}
                  className={
                    "px-4 py-2 text-sm font-medium border-b-2 " +
                    (selectedType === d.type
                      ? "text-purple-700 border-purple-600 bg-white"
                      : "text-gray-700 border-gray-100 hover:bg-gray-50")
                  }
                >
                  {d.type}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-b-lg shadow-lg p-6 -mt-px">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            {selectedType} Trends in {state}
          </h3>
          <p className="text-sm font-bold text-gray-600 mt-1 text-center">
            {data[0].year} - {data[data.length - 1].year}
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
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
                angle={-45}
                textAnchor="end"
                height={60}
              />
              {!rate && (
                <YAxis
                  label={{
                    value: "Number of Incidents",
                    angle: -90,
                    position: "outsideLeft",
                    offset: 0,
                    dx: -25, // shift further left
                    style: { textAnchor: "middle" },
                  }}
                  tick={{ fontSize: 12 }}
                />
              )}
              {rate && (
                <YAxis
                  label={{
                    value: "# Incidents / 100,000 People ",
                    angle: -90,
                    position: "outsideLeft",
                    offset: 0,
                    dx: -25, // shift further left
                    style: { textAnchor: "middle" },
                  }}
                  tick={{ fontSize: 12 }}
                />
              )}
              <Tooltip
                labelFormatter={(value) => `Year: ${value}`}
                formatter={(value, name) => [
                  value,
                  `${selectedType} ${rate ? "Rate" : "Count"}`,
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
                dataKey="count"
                stroke="#9333ea"
                strokeWidth={2}
                dot={{ fill: "#9333ea", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#9333ea", strokeWidth: 2 }}
              />
              {selectedType.toLowerCase() === "assault" && (
                <Line
                  type="monotone"
                  dataKey="us_assault"
                  name="US Assault Rate"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
