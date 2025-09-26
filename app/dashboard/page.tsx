"use client";
import { Amplify } from "aws-amplify";
import { getCurrentUser } from "aws-amplify/auth";
import awsExports from "../../src/aws-exports";
import { useState, useEffect } from "react";
import { useAddress } from "../context/AddressContext";
import { apiService } from "../api";
import { getTokens } from "../utils/tokens";
import Link from "next/link";

// Import all the chart components
import CensusChart from "../components/CensusChart";
import CrimeChart from "../components/CrimeChart";
import FederalDebtChart from "../components/FederalDebtChart";
import FederalEconomicChart from "../components/FederalEconomicChart";
import GovernmentSpendingChart from "../components/GovernmentSpendingChart";
import HealthChart from "../components/HealthChart";
import TaxCalculator from "../components/TaxCalculator";
import TreasuryStatementsChart from "../components/TreasuryStatementsChart";

Amplify.configure(awsExports);

export default function Dashboard() {
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>("");
  const { state } = useAddress();

  useEffect(() => {
    const loadUserInterests = async () => {
      try {
        await getCurrentUser();
        const userToken = await getTokens();
        setToken(userToken || "");

        if (userToken) {
          const interests = await apiService.getUserInterests(userToken);
          setUserInterests(interests.interests || []);
        }
      } catch (error) {
        console.error("Error loading user interests:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInterests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading your personalized dashboard...
          </p>
        </div>
      </div>
    );
  }

  // If no interests are set, redirect to start page
  if (userInterests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to GeoPolicy!
          </h2>
          <p className="text-gray-600 mb-6">
            It looks like you haven't set up your interests yet. Let's
            personalize your experience.
          </p>
          <Link
            href="/start_page"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Set Up Your Interests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Personalized Dashboard
          </h1>
          <p className="text-gray-600">
            Here's what's happening in the areas you care about most
          </p>
          {state && (
            <p className="text-sm text-purple-600 mt-2">📍 Data for {state}</p>
          )}
        </div>

        {/* Interest Tags */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Your Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {userInterests.map((interest) => (
              <span
                key={interest}
                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Interest Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userInterests.map((interest) => {
            return (
              <div
                key={interest}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {interest}
                  </h3>
                </div>
                <div className="px-6 pb-6"></div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/representatives"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <span className="text-2xl mb-2">🏛️</span>
              <span className="text-sm font-medium text-gray-900">
                Representatives
              </span>
            </Link>
            <Link
              href="/state_stats"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <span className="text-2xl mb-2">🏢</span>
              <span className="text-sm font-medium text-gray-900">
                State Stats
              </span>
            </Link>
            <Link
              href="/spending"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <span className="text-2xl mb-2">💰</span>
              <span className="text-sm font-medium text-gray-900">
                Spending
              </span>
            </Link>
            <Link
              href="/legislation"
              className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <span className="text-2xl mb-2">📜</span>
              <span className="text-sm font-medium text-gray-900">
                Legislation
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
