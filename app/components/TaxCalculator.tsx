"use client";
import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

interface TaxCalculation {
  totalTax: number;
  afterTaxIncome: number;
  effectiveRate: number;
  marginalRate: number;
}

const TAX_BRACKETS = {
  single: [
    { min: 0, max: 11000, rate: 0.1 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182050, rate: 0.24 },
    { min: 182050, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 22000, rate: 0.1 },
    { min: 22000, max: 89450, rate: 0.12 },
    { min: 89450, max: 190750, rate: 0.22 },
    { min: 190750, max: 364200, rate: 0.24 },
    { min: 364200, max: 462500, rate: 0.32 },
    { min: 462500, max: 693750, rate: 0.35 },
    { min: 693750, max: Infinity, rate: 0.37 },
  ],
  marriedSeparately: [
    { min: 0, max: 11000, rate: 0.1 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182050, rate: 0.24 },
    { min: 182050, max: 231250, rate: 0.32 },
    { min: 231250, max: 346875, rate: 0.35 },
    { min: 346875, max: Infinity, rate: 0.37 },
  ],
  headOfHousehold: [
    { min: 0, max: 15700, rate: 0.1 },
    { min: 15700, max: 59850, rate: 0.12 },
    { min: 59850, max: 95350, rate: 0.22 },
    { min: 95350, max: 182050, rate: 0.24 },
    { min: 182050, max: 231250, rate: 0.32 },
    { min: 231250, max: 578100, rate: 0.35 },
    { min: 578100, max: Infinity, rate: 0.37 },
  ],
};

const STANDARD_DEDUCTIONS = {
  single: 13850,
  married: 27700,
  marriedSeparately: 13850,
  headOfHousehold: 20800,
};

type FilingStatus = keyof typeof TAX_BRACKETS;

function calculateTax(
  income: number,
  filingStatus: FilingStatus
): TaxCalculation {
  const brackets = TAX_BRACKETS[filingStatus];
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus];
  const taxableIncome = Math.max(0, income - standardDeduction);

  let totalTax = 0;
  let remainingIncome = taxableIncome;

  // Find marginal rate
  let marginalRate = 0;
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      marginalRate = bracket.rate;
    }
  }

  // Calculate tax for each bracket
  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketIncome = Math.min(remainingIncome, bracket.max - bracket.min);
    const bracketTax = bracketIncome * bracket.rate;
    totalTax += bracketTax;
    remainingIncome -= bracketIncome;
  }

  const afterTaxIncome = income - totalTax;
  const effectiveRate = income > 0 ? totalTax / income : 0;

  return {
    totalTax,
    afterTaxIncome,
    effectiveRate,
    marginalRate,
  };
}

export default function TaxCalculator() {
  const [income, setIncome] = useState<string>("");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");

  const calculation = useMemo(() => {
    const incomeNum = parseFloat(income);
    if (isNaN(incomeNum) || incomeNum <= 0) {
      return null;
    }
    return calculateTax(incomeNum, filingStatus);
  }, [income, filingStatus]);

  const chartData = useMemo(() => {
    if (!calculation) return [];

    return [
      {
        name: "After-Tax Income",
        value: calculation.afterTaxIncome,
        color: "#10b981",
      },
      { name: "Federal Tax", value: calculation.totalTax, color: "#ef4444" },
    ];
  }, [calculation]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Federal Income Tax Calculator
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="income"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Annual Income
            </label>
            <input
              type="number"
              id="income"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="Enter your annual income"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-gray-800"
            />
          </div>

          <div>
            <label
              htmlFor="filingStatus"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filing Status
            </label>
            <select
              id="filingStatus"
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium text-gray-800"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
              <option value="marriedSeparately">
                Married Filing Separately
              </option>
              <option value="headOfHousehold">Head of Household</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {calculation ? (
            <>
              {/* Circular Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Tax Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Total Tax Owed:
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(calculation.totalTax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    After-Tax Income:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(calculation.afterTaxIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Effective Tax Rate:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatPercentage(calculation.effectiveRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Marginal Tax Rate:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatPercentage(calculation.marginalRate)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p className="text-center">
                Enter your income to see tax calculation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
