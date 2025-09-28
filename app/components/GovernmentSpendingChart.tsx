"use client";
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface SpendingData {
  name: string;
  amount: number;
  percent_budget: number;
}

interface BudgetFunctionsData {
  name: string;
  amount: number;
  percent_budget: number;
  description: string;
}

interface GovernmentSpendingData {
  agency_data: SpendingData[];
  budget_functions_data: BudgetFunctionsData[];
}

interface GovernmentSpendingChartProps {
  data: GovernmentSpendingData;
  userTax?: number; // User's calculated tax amount
}

// Color palette matching tax page style
const COLORS = [
  "#2563eb",
  "#16a34a",
  "#eab308",
  "#dc2626",
  "#9333ea",
  "#0891b2",
  "#be123c",
  "#7c3aed",
  "#ea580c",
  "#059669",
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
  return `${percentage.toFixed(1)}%`;
};

export default function GovernmentSpendingChart({
  data,
  userTax = 0,
}: GovernmentSpendingChartProps) {
  const [activeBudgetIndex, setActiveBudgetIndex] = useState<number | null>(
    null
  );
  const [activeAgencyIndex, setActiveAgencyIndex] = useState<number | null>(
    null
  );
  const [clickedBudgetIndex, setClickedBudgetIndex] = useState<number | null>(
    null
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

  // Process data for display - take top 8 items and group the rest
  const processData = (rawData: SpendingData[]) => {
    const top8Data = rawData.slice(0, 8);
    const otherData = rawData.slice(8);

    let processedData = [...top8Data];
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

    return processedData.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
    }));
  };

  const budgetFunctionsData = processData(data.budget_functions_data);
  const agencyData = processData(data.agency_data);

  return (
    <section className="relative w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 text-center"
      >
        Here's how your{" "}
        <span className="text-blue-600">${userTax.toLocaleString()}</span> is
        spent
      </motion.h2>

      {/* Budget Functions Section */}
      <div className="w-full max-w-4xl mb-16">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center"
        >
          Budget Functions
        </motion.h3>
        <p className="text-gray-600 text-center">
          Click on a budget function to see description of the function
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mt-8">
          {/* Budget Functions Chart */}
          <div className="h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetFunctionsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="percent_budget"
                  paddingAngle={3}
                  onMouseEnter={(_, index) => setActiveBudgetIndex(index)}
                  onMouseLeave={() => setActiveBudgetIndex(null)}
                  onClick={(_, index) =>
                    setClickedBudgetIndex(
                      clickedBudgetIndex === index ? null : index
                    )
                  }
                >
                  {budgetFunctionsData.map((entry, index) => (
                    <Cell
                      key={`budget-cell-${index}`}
                      fill={entry.color}
                      stroke={activeBudgetIndex === index ? "#111827" : "#fff"}
                      strokeWidth={activeBudgetIndex === index ? 3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    userTax > 0
                      ? `${((value / 100) * userTax).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })} (${value.toFixed(1)}%)`
                      : `${value.toFixed(1)}%`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Functions Narration */}
          <div className="space-y-6">
            {budgetFunctionsData.map((item, index) => {
              const originalItem = data.budget_functions_data[index];
              const isClicked = clickedBudgetIndex === index;

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`bg-white p-4 rounded-2xl shadow-md transition-all hover:shadow-lg cursor-pointer ${
                    isClicked ? "ring-2 ring-blue-500 shadow-lg" : ""
                  }`}
                  onClick={() =>
                    setClickedBudgetIndex(
                      clickedBudgetIndex === index ? null : index
                    )
                  }
                >
                  <h3 className="font-semibold text-lg text-gray-800">
                    {item.name}
                  </h3>
                  <p className="text-gray-600">
                    About{" "}
                    <span className="font-bold text-gray-900">
                      {item.percent_budget.toFixed(1)}%
                    </span>{" "}
                    of your taxes →{" "}
                    <span className="font-bold text-blue-600">
                      {userTax > 0
                        ? (
                            (item.percent_budget / 100) *
                            userTax
                          ).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })
                        : formatCurrency(item.amount)}
                    </span>
                  </p>
                  {isClicked && originalItem?.description && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 pt-3 border-t border-gray-200"
                    >
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {originalItem.description}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agency Spending Section */}
      <div className="w-full max-w-4xl">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center"
        >
          Federal Agency Spending
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Agency Chart */}
          <div className="h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="percent_budget"
                  paddingAngle={3}
                  onMouseEnter={(_, index) => setActiveAgencyIndex(index)}
                  onMouseLeave={() => setActiveAgencyIndex(null)}
                >
                  {agencyData.map((entry, index) => (
                    <Cell
                      key={`agency-cell-${index}`}
                      fill={entry.color}
                      stroke={activeAgencyIndex === index ? "#111827" : "#fff"}
                      strokeWidth={activeAgencyIndex === index ? 3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    userTax > 0
                      ? `${((value / 100) * userTax).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })} (${value.toFixed(1)}%)`
                      : `${value.toFixed(1)}%`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Agency Narration */}
          <div className="space-y-6">
            {agencyData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-4 rounded-2xl shadow-md transition-all hover:shadow-lg"
              >
                <h3 className="font-semibold text-lg text-gray-800">
                  {item.name}
                </h3>
                <p className="text-gray-600">
                  About{" "}
                  <span className="font-bold text-gray-900">
                    {item.percent_budget.toFixed(1)}%
                  </span>{" "}
                  of your taxes →{" "}
                  <span className="font-bold text-blue-600">
                    {userTax > 0
                      ? ((item.percent_budget / 100) * userTax).toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                          }
                        )
                      : formatCurrency(item.amount)}
                  </span>
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-12 text-center max-w-2xl"
      >
        <p className="text-gray-600 text-lg">
          These charts show how your federal tax dollars are allocated across
          budget functions and which specific agencies receive the funding.
        </p>
      </motion.div>
    </section>
  );
}
