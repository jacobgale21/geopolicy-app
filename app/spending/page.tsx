"use client";
import TaxCalculator from "../components/TaxCalculator";
import GovernmentSpendingChart from "../components/GovernmentSpendingChart";
import FederalEconomicChart from "../components/FederalEconomicChart";
import FederalDebtAndTreasuryChart from "../components/FederalDebtAndTreasuryChart";
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

interface EconomicDataPoint {
  date: number;
  pce_price_index: number;
  gdp: number;
  wages_and_salaries: number;
}

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

export default function SpendingPage() {
  const [governmentSpendingData, setGovernmentSpendingData] =
    useState<GovernmentSpendingData | null>(null);
  const [budgetFunctionsData, setBudgetFunctionsData] = useState<
    SpendingData[]
  >([]);
  const [agencyData, setAgencyData] = useState<SpendingData[]>([]);
  const [userTaxAmount, setUserTaxAmount] = useState<number>(0);
  const [economicData, setEconomicData] = useState<EconomicDataPoint[]>([]);
  const [federalDebt, setFederalDebt] = useState<DebtDataPoint[]>([]);
  const [treasuryStatements, setTreasuryStatements] = useState<
    TreasuryStatement[]
  >([]);
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

            // Fetch federal economic data
            const economicDataResponse =
              await apiService.getFederalEconomicData(token);
            console.log("Economic data:", economicDataResponse);
            if (economicDataResponse.economic_data) {
              const federalEconomicData =
                economicDataResponse.economic_data.map(
                  (item: [number, number, number, number]) => ({
                    date: item[0],
                    pce_price_index: item[1],
                    gdp: item[2],
                    wages_and_salaries: item[3],
                  })
                );
              setEconomicData(federalEconomicData);
            }

            // Fetch federal debt and treasury statements data
            try {
              const debtDataResponse = await apiService.getFederalDebt(token);
              console.log("Debt data:", debtDataResponse);

              if (debtDataResponse.federal_debt) {
                const debtData = debtDataResponse.federal_debt.map(
                  (item: [number, number]) => ({
                    year: item[0],
                    debt: item[1],
                  })
                );
                setFederalDebt(debtData);
              }

              if (debtDataResponse.treasury_statements) {
                const treasuryData = debtDataResponse.treasury_statements.map(
                  (item: {
                    record_date: string;
                    current_month_gross_rcpt_amt: number;
                    current_month_gross_outly_amt: number;
                    current_month_dfct_sur_amt: number;
                  }) => ({
                    record_date: item["record_date"],
                    current_month_gross_rcpt_amt:
                      item["current_month_gross_rcpt_amt"],
                    current_month_gross_outly_amt:
                      item["current_month_gross_outly_amt"],
                    current_month_dfct_sur_amt:
                      item["current_month_dfct_sur_amt"],
                  })
                );
                console.log("Treasury data:", treasuryData);
                setTreasuryStatements(treasuryData);
              }
            } catch (error) {
              console.error("Failed to fetch debt and treasury data:", error);
            }
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

      {/* Federal Economic Data Chart */}
      <div className="flex items-center justify-center p-4 pt-14">
        <div className="w-full max-w-4xl">
          {economicData.length > 0 && (
            <FederalEconomicChart data={economicData} />
          )}
        </div>
      </div>

      {/* Federal Debt & Treasury Statements Charts */}
      <div className="flex items-center justify-center p-4 pt-16">
        <div className="w-full max-w-4xl">
          {(federalDebt.length > 0 || treasuryStatements.length > 0) && (
            <FederalDebtAndTreasuryChart
              federalDebt={federalDebt}
              treasuryStatements={treasuryStatements}
            />
          )}
        </div>
      </div>
    </div>
  );
}
