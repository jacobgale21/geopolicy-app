"use client";

import { useState, useEffect } from "react";
import { apiService } from "../api";
import { getTokens } from "../utils/tokens";
interface BenefitsProps {
  income: number;
}

export default function Benefits({ income }: BenefitsProps) {
  const [federalFpl, setFederalFpl] = useState<number>(0);
  const [householdSize, setHouseholdSize] = useState<number>(1);
  const [age, setAge] = useState<number>(0);
  const [veteran, setVeteran] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  useEffect(() => {
    const getToken = async () => {
      const tokens = await getTokens();
      if (tokens) {
        setToken(tokens);
      }
    };
    getToken();
  }, []);

  const calculateBenefits = async (
    income: number,
    householdSize: number,
    age: number,
    veteran: boolean
  ) => {
    setIsCalculating(true);
    setBenefits([]); // Clear previous benefits

    try {
      const Fpl = await apiService.getFederalFpl(householdSize, token);
      const federalFpl = Fpl.fpl;
      const newBenefits: string[] = [];
      // Potential benefits: Medicare, Medicaid
      if (income <= federalFpl * 1.38) {
        newBenefits.push("Medicaid");
      }
      if (income < federalFpl * 2) {
        newBenefits.push("SNAP");
      }
      if (age >= 65) {
        newBenefits.push("Medicare");
      }
      if (age >= 67) {
        newBenefits.push("Social Security");
      }
      if (veteran) {
        newBenefits.push("Veterans Benefits");
      }

      setBenefits(newBenefits);
      console.log(newBenefits);
    } catch (error) {
      console.error("Error calculating benefits:", error);
      setBenefits(["Error calculating benefits"]);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCalculate = () => {
    if (income > 0 && householdSize > 0 && age > 0) {
      calculateBenefits(income, householdSize, age, veteran);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Federal Benefits Calculator
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Household Size
            </label>
            <input
              type="number"
              min="1"
              value={householdSize}
              onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="text"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={veteran}
                onChange={(e) => setVeteran(e.target.checked)}
                className="mr-2"
              />
              <span className="text-md font-medium text-gray-700">
                Veteran Status
              </span>
            </label>
          </div>

          <button
            onClick={handleCalculate}
            disabled={
              isCalculating || income <= 0 || householdSize <= 0 || age <= 0
            }
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCalculating ? "Calculating..." : "Calculate Benefits"}
          </button>

          {benefits.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Available Benefits:
              </h3>
              <ul className="space-y-1">
                {benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-md"
                  >
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {benefits.length === 0 && !isCalculating && (
            <div className="mt-4 text-gray-500 text-center">
              No benefits available based on current criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
