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
} from "recharts";
import { motion } from "framer-motion";

interface EconomicDataPoint {
  date: number;
  pce_price_index: number;
  gdp: number;
  wages_and_salaries: number;
}

interface FederalEconomicChartProps {
  data: EconomicDataPoint[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function FederalEconomicChart({
  data,
}: FederalEconomicChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Federal Economic Data
        </h2>
        <p className="text-gray-600 text-center">No economic data available</p>
      </div>
    );
  }

  // Transform data for better display
  const chartData = data.map((item) => ({
    ...item,
    gdp: item.gdp / 1000, // Convert to trillions
    wages_and_salaries: item.wages_and_salaries,
    inflation: 0,
  }));

  const getGDPSummary = () => {
    const firstPastYear = chartData[0].gdp;
    const lastFutureYear = chartData[chartData.length - 1].gdp;
    const lastPastYear = chartData.find((item) => item.date === 2025)?.gdp;
    const lastPastInflation = chartData.find(
      (item) => item.date === 2025
    )?.inflation;

    const firstPastInflation = chartData[1].inflation;
    const lastFutureInflation = chartData[chartData.length - 1].inflation;

    if (!lastPastYear || !lastPastInflation) {
      return {
        totalIncrease: 0,
        averageAnnualIncrease: 0,
        lastYear: 0,
        lastPastInflation: 0,
      };
    }
    const totalPastPercentageIncrease =
      ((lastPastYear - firstPastYear) / firstPastYear) * 100;
    const totalFuturePercentageIncrease =
      ((lastFutureYear - lastPastYear) / lastPastYear) * 100;
    const totalPastInflation = lastPastInflation - firstPastInflation;
    const totalFutureInflation = lastFutureInflation - lastPastInflation;
    return {
      totalPastIncrease: totalPastPercentageIncrease,
      averageAnnualIncrease:
        totalPastPercentageIncrease / (2025 - chartData[0].date),
      totalFutureIncrease: totalFuturePercentageIncrease,
      averageAnnualFutureIncrease:
        totalFuturePercentageIncrease /
        (chartData[chartData.length - 1].date - 2025),
      totalPastInflation: totalPastInflation,
      totalFutureInflation: totalFutureInflation,
    };
  };

  for (let i = 1; i < chartData.length; i++) {
    chartData[i].inflation =
      ((chartData[i].pce_price_index - chartData[i - 1].pce_price_index) /
        chartData[i - 1].pce_price_index) *
      100;
  }
  const gdpSummary = getGDPSummary();
  return (
    <section className="relative w-full bg-white rounded-lg shadow-lg p-6 mx-6 mb-8">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center"
      >
        Federal Economic Indicators Over Time
      </motion.h2>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="space-y-8"
      >
        {/* GDP Chart */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-4 text-center text-lg">
            GDP (Trillions $)
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
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${formatNumber(value)}T`}
                  domain={[0, "dataMax + 10"]}
                  label={{
                    value: "GDP (Trillions $)",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fontSize: "12px",
                      fill: "#6b7280",
                    },
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
                            GDP: {formatCurrency(payload[0].value)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="gdp"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: "#2563eb", strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: "#2563eb", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wages & Salaries Chart */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-4 text-center text-lg">
            Wages & Salaries
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
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${formatNumber(value)}`}
                  domain={["0", "dataMax + 10"]}
                  label={{
                    value: "Wages & Salaries",
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
                            Wages & Salaries: {formatCurrency(payload[0].value)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="wages_and_salaries"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ fill: "#16a34a", strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: "#16a34a", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PCE Price Index Chart */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-4 text-center text-lg">
            PCE Price Index
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
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                  domain={["dataMin", "dataMax + 5"]}
                  label={{
                    value: "PCE Price Index",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fontSize: "12px",
                      fill: "#6b7280",
                    },
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
                            PCE Price Index: {formatNumber(payload[0].value)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pce_price_index"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={{ fill: "#eab308", strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: "#eab308", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inflation Chart */}
        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-4 text-center text-lg">
            Yearly Inflation Rate (%)
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData.slice(1)}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${formatNumber(value)}%`}
                  domain={[0, "dataMax + 1"]}
                  label={{
                    value: "Inflation Rate (%)",
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
                            Inflation Rate: {payload[0].value?.toFixed(2)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="inflation"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ fill: "#dc2626", strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 4, stroke: "#dc2626", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Description */}
      {gdpSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8 text-center max-w-4xl mx-auto"
        >
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                GDP (Gross Domestic Product)
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                The total value of goods and services produced in the United
                States, representing the overall economic output.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-700">
                    {gdpSummary.totalPastIncrease?.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Total Increase</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Over {2025 - chartData[0].date} years
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-700">
                    {gdpSummary.averageAnnualIncrease?.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Average Annual Increase
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Per year ({chartData[0].date} - 2025)
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-700">
                    {gdpSummary.totalFutureIncrease?.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Projected Increase
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Over next {chartData[chartData.length - 1].date - 2025}{" "}
                    years
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-700">
                    {gdpSummary.averageAnnualFutureIncrease?.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Average Annual Increase
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Per year (2025 - {chartData[chartData.length - 1].date})
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                Wages & Salaries
              </h3>
              <p className="text-green-700 text-sm">
                Total compensation paid to employees, including wages, salaries,
                and other forms of compensation.
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">
                PCE Price Index
              </h3>
              <p className="text-yellow-700 text-sm">
                A measure of inflation based on the prices of goods and services
                consumed by households.
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">
                Yearly Inflation Rate
              </h3>
              <p className="text-red-700 text-sm mb-4">
                The year-over-year percentage change in the PCE Price Index,
                showing the rate of inflation from one year to the next.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-red-700">
                    {gdpSummary.totalPastInflation?.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Average Annual Past Inflation
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Per year ({chartData[0].date} - 2025)
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-red-700">
                    {gdpSummary.totalFutureInflation?.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Average Annual Future Inflation
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Per year (2025 - {chartData[chartData.length - 1].date})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
