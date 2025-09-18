"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { getTokens } from "../utils/tokens";
import { apiService } from "../api";
import { useAddress } from "../context/AddressContext";
import HealthChart from "../components/HealthChart";

interface HealthDataPoint {
  state: string;
  year: number;
  rank: number;
  name: string;
  value: number;
}

const HEALTH_ISSUES = [
  { id: "Diabetes", name: "Diabetes", color: "bg-red-500 hover:bg-red-600" },
  { id: "AIDS", name: "HIV/AIDS", color: "bg-purple-500 hover:bg-purple-600" },
  {
    id: "Heart Diseases",
    name: "Heart Diseases",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  { id: "Cancer", name: "Cancer", color: "bg-green-500 hover:bg-green-600" },
  {
    id: "Suicide",
    name: "Suicide",
    color: "bg-yellow-500 hover:bg-yellow-600",
  },
  {
    id: "Depression",
    name: "Depression",
    color: "bg-indigo-500 hover:bg-indigo-600",
  },
  {
    id: "Drug Deaths",
    name: "Drug Deaths",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  { id: "Smoking", name: "Smoking", color: "bg-gray-500 hover:bg-gray-600" },
];

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

export default function HealthPage() {
  const [selectedHealthIssue, setSelectedHealthIssue] = useState<string>("");
  const [healthData, setHealthData] = useState<HealthDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { state, setState } = useAddress();

  const fetchHealthData = async (healthIssue: string) => {
    if (!state || !healthIssue) return;

    setLoading(true);
    setError("");

    try {
      const token = await getTokens();
      if (token) {
        const data = await apiService.getHealthData(state, healthIssue, token);
        console.log(data);
        const healthData: HealthDataPoint[] = data.map(
          (item: [string, number, number, string, number]) => ({
            state: item[0],
            year: item[1],
            rank: item[2],
            name: item[3],
            value: item[4],
          })
        );
        setHealthData(healthData);
      }
    } catch (err) {
      setError("Failed to fetch health data. Please try again.");
      console.error("Health data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHealthIssueClick = (healthIssue: string) => {
    setSelectedHealthIssue(healthIssue);
    fetchHealthData(healthIssue);
  };

  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
      } catch {
        // not signed in; do nothing
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-100 flex items-center justify-center p-4 pt-14">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Health Statistics Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Explore health data across different states and conditions
          </p>
        </div>

        {/* State Selection */}
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 mb-8">
          <label
            htmlFor="state-select"
            className="block text-lg font-medium text-gray-700 mb-3"
          >
            Select State
          </label>
          <select
            id="state-select"
            value={state || ""}
            onChange={(e) => setState(e.target.value)}
            className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-lg"
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

        {/* Health Issue Buttons */}
        {state && (
          <div className="bg-white border border-gray-200 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Select Health Issue for {state}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {HEALTH_ISSUES.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => handleHealthIssueClick(issue.id)}
                  className={`${issue.color} text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-105 ${
                    selectedHealthIssue === issue.id
                      ? "ring-4 ring-offset-2 ring-green-300"
                      : ""
                  }`}
                >
                  {issue.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading health data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Health Data Display */}
        {healthData.length > 0 && !loading && (
          <>
            {/* Chart Component */}
            <div className="mb-8">
              <HealthChart
                data={healthData}
                state={state}
                healthIssue={selectedHealthIssue}
              />
            </div>
          </>
        )}

        {/* No Data Message */}
        {selectedHealthIssue &&
          healthData.length === 0 &&
          !loading &&
          !error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-6 text-center">
              <p className="text-yellow-800">
                No data available for {selectedHealthIssue} in {state}. Try
                selecting a different health issue.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
