"use client";
import React from "react";
import { motion } from "framer-motion";
import FederalDebtChart from "./FederalDebtChart";
import TreasuryStatementsChart from "./TreasuryStatementsChart";

interface DebtDataPoint {
  year: number;
  debt: number;
}

interface TreasuryStatement {
  record_date: string;
  current_month_gross_rcpt_amt: number;
  current_month_gross_outly_amt: number;
  current_month_dfct_sur_amt: number;
}

interface FederalDebtAndTreasuryChartProps {
  federalDebt: DebtDataPoint[];
  treasuryStatements: TreasuryStatement[];
}

export default function FederalDebtAndTreasuryChart({
  federalDebt,
  treasuryStatements,
}: FederalDebtAndTreasuryChartProps) {
  // Calculate debt summary statistics
  const getDebtSummary = () => {
    if (!federalDebt || federalDebt.length === 0) return null;

    const sortedDebt = [...federalDebt].sort((a, b) => a.year - b.year);
    const firstYear = sortedDebt[0];
    const lastYear = sortedDebt[sortedDebt.length - 1];

    const totalIncrease =
      ((lastYear.debt - firstYear.debt) / firstYear.debt) * 100;
    const yearsSpan = lastYear.year - firstYear.year;
    const averageAnnualIncrease = totalIncrease / yearsSpan;

    return {
      firstYear: firstYear.year,
      lastYear: lastYear.year,
      firstDebt: firstYear.debt,
      lastDebt: lastYear.debt,
      totalIncrease,
      yearsSpan,
      averageAnnualIncrease,
    };
  };

  const debtSummary = getDebtSummary();

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
        Federal Debt & Treasury Statements
      </motion.h2>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="space-y-8"
      >
        {/* Federal Debt Chart */}
        <FederalDebtChart data={federalDebt} />

        {/* Treasury Statements Chart */}
        <TreasuryStatementsChart data={treasuryStatements} />
      </motion.div>

      {/* Description */}
      {debtSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8 text-center max-w-4xl mx-auto"
        >
          <div className="space-y-2">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">
                Federal Debt
              </h3>
              <p className="text-purple-700 text-sm">
                The total amount of money that the federal government owes to
                its creditors, representing the cumulative deficit over time.
              </p>
              <div className="bg-purple-50 p-6 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-purple-700">
                      {debtSummary.totalIncrease.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Total Increase</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Over {debtSummary.yearsSpan} years
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-purple-700">
                      {debtSummary.averageAnnualIncrease.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Average Annual Increase
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Per year</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-lg font-bold text-purple-700">
                      ${(debtSummary.lastDebt / 1000000000000).toFixed(1)}T
                    </div>
                    <div className="text-sm text-gray-600">Current Debt</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {debtSummary.lastYear}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900">
                Treasury Statements
              </h3>
              <p className="text-orange-700 text-sm">
                Monthly financial statements showing government receipts
                (income), outlays (spending), and the resulting deficit or
                surplus for each month.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
