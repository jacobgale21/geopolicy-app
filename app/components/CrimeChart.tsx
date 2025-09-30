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
}

export default function CrimeChart({
  data,
  state,
  crimeType,
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
  const rate = crimeType.toLowerCase() !== "homicide";

  // Transform data for Recharts and merge national assault rates from cache when available
  const chartData = data.map((item) => {
    const yearKey = String(item.year);
    let nationalAssault = null;
    let nationalBurglary = null;
    if (crimeType.toLowerCase() === "assault") {
      nationalAssault = (usData as Record<string, any>)[yearKey]?.assault;
    }
    if (crimeType.toLowerCase() === "burglary") {
      nationalBurglary = (usData as Record<string, any>)[yearKey]?.burglary;
    }
    return {
      year: item.year,
      count: item.crime_counts,
      us_assault: typeof nationalAssault === "number" ? nationalAssault : null,
      us_burglary:
        typeof nationalBurglary === "number" ? nationalBurglary : null,
    };
  });

  return (
    <div>
      {/* Tabs above the box */}

      <div className="bg-white rounded-lg shadow-lg p-6 -mt-px mb-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            {crimeType} Trends
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
                  `${crimeType} ${rate ? "Rate" : "Count"}`,
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
              {crimeType.toLowerCase() === "assault" && (
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
              {crimeType.toLowerCase() === "burglary" && (
                <Line
                  type="monotone"
                  dataKey="us_burglary"
                  name="US Burglary Rate"
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
