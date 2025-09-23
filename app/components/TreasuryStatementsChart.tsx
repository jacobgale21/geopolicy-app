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
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";

interface TreasuryStatement {
  record_date: Date;
  current_month_gross_rcpt_amt: number;
  current_month_gross_outly_amt: number;
  current_month_dfct_sur_amt: number;
}

interface TreasuryStatementsChartProps {
  data: TreasuryStatement[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function TreasuryStatementsChart({
  data,
}: TreasuryStatementsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Treasury Statements
        </h2>
        <p className="text-gray-600 text-center">No treasury data available</p>
      </div>
    );
  }
  // Transform data for better display
  const chartData = data.map((item) => {
    // Parse the date more reliably to avoid timezone issues
    const date = new Date(item.record_date);
    const year = date.getFullYear();
    let month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
    let monthString = month.toString();
    if (month < 10) {
      monthString = `0${month.toString()}`;
    }
    return {
      ...item,
      date: `${monthString}/${year}`,
      receipts_billions: (
        Number(item.current_month_gross_rcpt_amt) / 1000
      ).toFixed(2),
      outlays_billions: (
        Number(item.current_month_gross_outly_amt) / 1000
      ).toFixed(2),
      deficit_surplus_billions: (
        Number(item.current_month_dfct_sur_amt) / 1000
      ).toFixed(2),
    };
  });
  // Debug: Log the transformed dat

  return (
    <div className="bg-orange-50 p-6 rounded-lg">
      <h3 className="font-semibold text-orange-900 mb-4 text-center text-lg">
        Monthly Treasury Statements (Billions $)
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
            <ReferenceLine
              y={0}
              stroke="#374151"
              strokeDasharray="2 2"
              strokeWidth={2}
              label={{
                value: "Surplus",
                position: "bottom",
                offset: 20,
                style: {
                  fill: "#374151",
                  fontSize: "12px",
                  fontWeight: "bold",
                },
              }}
            />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}B`}
              domain={["dataMin - 50", "dataMax + 50"]}
              label={{
                value: "Amount (Billions $)",
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
                        Date: {label}
                      </p>

                      {payload.map((entry: any, index: number) => {
                        return (
                          <p key={index} style={{ color: entry.color }}>
                            {entry.name}:{" "}
                            {formatCurrency(
                              Number(entry.payload[entry.dataKey])
                            )}
                            B
                          </p>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="receipts_billions"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ fill: "#16a34a", strokeWidth: 1, r: 3 }}
              activeDot={{ r: 4, stroke: "#16a34a", strokeWidth: 2 }}
              name="Receipts"
            />
            <Line
              type="monotone"
              dataKey="outlays_billions"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ fill: "#dc2626", strokeWidth: 1, r: 3 }}
              activeDot={{ r: 4, stroke: "#dc2626", strokeWidth: 2 }}
              name="Outlays"
            />
            <Line
              type="monotone"
              dataKey="deficit_surplus_billions"
              stroke="#ea580c"
              strokeWidth={2}
              dot={{ fill: "#ea580c", strokeWidth: 1, r: 3 }}
              activeDot={{ r: 4, stroke: "#ea580c", strokeWidth: 2 }}
              name="Deficit/Surplus"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
