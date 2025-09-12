"use client";

import { useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { seedUsAveragesCache } from "../utils/usCensusCache";
import { getTokens } from "../utils/tokens";
import { apiService } from "../api";
import { useEffect } from "react";
import { useAddress } from "../context/AddressContext";
import CensusChart from "../components/CensusChart";

interface CensusDataPoint {
  year: number;
  poverty_rate: number;
  educational: number;
  income_mean: number;
  income_median: number;
}

const STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

export default function SpendingPage() {
  const [censusData, setCensusData] = useState<CensusDataPoint[]>([]);
  const { state, setState } = useAddress();
  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        seedUsAveragesCache([2021, 2022, 2023]);
        // Fetch government spending data
        const token = await getTokens();
        if (token) {
          try {
            if (state) {
              const censusDataResponse = await apiService.getCensusData(
                state,
                token
              );
              const newCensusData = censusDataResponse.map(
                (item: [string, number, number, number, number, number]) => ({
                  year: item[1],
                  poverty_rate: item[2],
                  educational: item[3],
                  income_mean: item[4],
                  income_median: item[5],
                })
              );
              setCensusData(newCensusData);
            }
          } catch (error) {
            console.error("Failed to fetch government spending data:", error);
          }
        }
      } catch {
        // not signed in; do nothing
      }
    })();
  }, [state]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4 pt-14">
      <div className="w-full max-w-2xl">
        {state === "" && (
          <div className="bg-white border border-gray-200 rounded-lg shadow p-4">
            <label
              htmlFor="state-select"
              className="block text-md font-medium text-gray-700 mb-2"
            >
              Select State
            </label>
            <select
              id="state-select"
              value={state || ""}
              onChange={(e) => setState(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            >
              <option value="" disabled>
                Choose State
              </option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Census Data Chart */}
        {censusData.length > 0 && (
          <div className="mt-6 pt-4">
            <CensusChart data={censusData} state={state} />
          </div>
        )}
      </div>
    </div>
  );
}
