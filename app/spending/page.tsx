"use client";
import TaxCalculator from "../components/TaxCalculator";
import GovernmentSpendingChart from "../components/GovernmentSpendingChart";
import { useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { seedUsAveragesCache } from "../utils/usCensusCache";
import { getTokens } from "../utils/tokens";
import { apiService } from "../api";
import { useEffect } from "react";

interface SpendingData {
  name: string;
  amount: number;
  percent_budget: number;
}

interface GovernmentSpendingData {
  agency_data: SpendingData[];
  budget_functions_data: SpendingData[];
}

export default function SpendingPage() {
  const [governmentSpendingData, setGovernmentSpendingData] =
    useState<GovernmentSpendingData | null>(null);
  const [budgetFunctionsData, setBudgetFunctionsData] = useState<
    SpendingData[]
  >([]);
  const [agencyData, setAgencyData] = useState<SpendingData[]>([]);
  const [userTaxAmount, setUserTaxAmount] = useState<number>(0);
  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        seedUsAveragesCache([2021, 2022, 2023]);

        // Fetch government spending data
        const token = await getTokens();
        if (token) {
          try {
            const spendingData = await apiService.getAgencySpending(token);
            // console.log(spendingData);
            const budgetFunctions = spendingData.budget_functions_data.map(
              (item: [string, number, number]) => ({
                name: item[0],
                amount: item[1],
                percent_budget: item[2],
              })
            );
            setBudgetFunctionsData([
              ...budgetFunctionsData,
              ...budgetFunctions,
            ]);
            const agency = spendingData.agency_data.map(
              (item: [string, number, number]) => ({
                name: item[0],
                amount: item[1],
                percent_budget: item[2],
              })
            );
            setAgencyData(agency);

            const governmentSpending = {
              agency_data: agency,
              budget_functions_data: budgetFunctions,
            };
            setGovernmentSpendingData(governmentSpending);
            console.log(governmentSpending);
          } catch (error) {
            console.error("Failed to fetch government spending data:", error);
          }
        }
      } catch {
        // not signed in; do nothing
      }
    })();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Tax Calculator */}
      <div className="flex items-center justify-center p-4 pt-14">
        <div className="w-full max-w-2xl">
          <TaxCalculator onTaxCalculated={setUserTaxAmount} />
        </div>
      </div>

      {/* Government Spending Chart */}
      {governmentSpendingData && (
        <GovernmentSpendingChart
          data={governmentSpendingData}
          userTax={userTaxAmount}
        />
      )}
    </div>
  );
}
