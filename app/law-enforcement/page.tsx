"use client";

import { useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { seedUsAveragesCache } from "../utils/usCensusCache";
import { getTokens } from "../utils/tokens";
import { apiService } from "../api";
import { useEffect } from "react";
import { useAddress } from "../context/AddressContext";
import CrimeChart from "../components/CrimeChart";

interface CrimeDataPoint {
  year: string;
  crime_counts: number;
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

export default function LawEnforcementPage() {
  const [homicideData, setHomicideData] = useState<CrimeDataPoint[]>([]);
  const [assaultData, setAssaultData] = useState<CrimeDataPoint[]>([]);
  const [burglaryData, setBurglaryData] = useState<CrimeDataPoint[]>([]);
  const { state, setState } = useAddress();
  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        seedUsAveragesCache([2021, 2022, 2023]);
        const token = await getTokens();
        if (token) {
          try {
            if (state) {
              const crimeDataResponse = await apiService.getAllStateCrime(
                state,
                token
              );
              const newHomicideData = crimeDataResponse
                .filter(
                  (item: [number, string, string, number, number]) =>
                    item[2].toLowerCase() === "homicide"
                )
                .map((item: [number, string, string, number, number]) => ({
                  year: item[4],
                  crime_counts: item[3],
                }));
              const newAssaultData = crimeDataResponse
                .filter(
                  (item: [number, string, string, number, number]) =>
                    item[2].toLowerCase() === "assault"
                )
                .map((item: [number, string, string, number, number]) => ({
                  year: item[4],
                  crime_counts: item[3],
                }));
              const newBurglaryData = crimeDataResponse
                .filter(
                  (item: [number, string, string, number, number]) =>
                    item[2].toLowerCase() === "burglary"
                )
                .map((item: [number, string, string, number, number]) => ({
                  year: item[4],
                  crime_counts: item[3],
                }));
              setHomicideData(newHomicideData);
              setAssaultData(newAssaultData);
              setBurglaryData(newBurglaryData);
            }
          } catch (error) {
            console.error("Failed to fetch state crime data:", error);
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
        {state != "" && (
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Crime Statistics for {state}
            </h2>
          </div>
        )}
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
        )}{" "}
        {/* Crime Data Chart */}
        {homicideData.length > 0 && (
          <div className="mt-6 pt-4">
            <CrimeChart
              data={homicideData}
              state={state}
              homicideData={homicideData}
              assaultData={assaultData}
              burglaryData={burglaryData}
              crimeType="Homicide"
            />
          </div>
        )}
      </div>
    </div>
  );
}
