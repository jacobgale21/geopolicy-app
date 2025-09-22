"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface DebtDataPoint {
  year: number;
  debt: number;
}

interface FederalDebtChartProps {
  data: DebtDataPoint[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatTrillions = (value: number) => {
  return `$${(value / 1000000000000).toFixed(1)}T`;
};

export default function FederalDebtChart({ data }: FederalDebtChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Federal Debt
        </h2>
        <p className="text-gray-600 text-center">No debt data available</p>
      </div>
    );
  }

  // Transform data for better display
  const chartData = data.map((item) => ({
    ...item,
    debt_trillions: item.debt / 1000000000000, // Convert to trillions
  }));

  return (
    <div className="bg-purple-50 p-6 rounded-lg">
      <h3 className="font-semibold text-purple-900 mb-4 text-center text-lg">
        Federal Debt (Trillions $)
      </h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toFixed(1)}T`}
              domain={["dataMin - 1", "dataMax + 1"]}
              label={{
                value: "Debt (Trillions $)",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fontSize: "12px",
                  fill: "#6b7280",
                },
                dx: -10,
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border border-gray-200 rounded shadow-lg text-xs">
                      <p className="font-semibold text-gray-900">
                        Year: {label}
                      </p>
                      <p style={{ color: payload[0].color }}>
                        Debt: {formatCurrency(payload[0].payload.debt)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="debt_trillions"
              stroke="#9333ea"
              strokeWidth={3}
              dot={{ fill: "#9333ea", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#9333ea", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
