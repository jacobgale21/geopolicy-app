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
} from "recharts";

interface CrimeDataPoint {
  month_year: string;
  crime_counts: number;
}

interface CrimeChartProps {
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

  // Transform data for Recharts - it expects an array of objects with consistent property names
  const chartData = data.map((item) => ({
    month: item.month_year,
    count: item.crime_counts,
  }));

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {crimeType} Trends in {state}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Data points: {data.length} months
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
              dataKey="month"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              label={{
                value: "Number of Incidents",
                angle: -90,
                position: "insideMiddle",
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              labelFormatter={(value) => `Month: ${value}`}
              formatter={(value, name) => [value, `${crimeType} Count`]}
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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
