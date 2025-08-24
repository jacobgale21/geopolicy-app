"use client";
import { Amplify } from "aws-amplify";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import awsExports from "../src/aws-exports";
import "@aws-amplify/ui-react/styles.css";
import { apiService, Legislator } from "./api";
import { useState } from "react";

Amplify.configure(awsExports);

async function getTokens() {
  try {
    const session = await fetchAuthSession();
    if (session.tokens) {
      return session.tokens.accessToken?.toString();
    } else {
      console.log("No tokens available");
    }
  } catch (error) {
    console.error("Error getting tokens:", error);
  }
}

export default function Home() {
  const [legislators, setLegislators] = useState<Legislator[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [findReps, setFindReps] = useState<boolean>(false);
  const getLegislators = async (address: string) => {
    try {
      const token = await getTokens();
      if (!token) {
        console.error("No token available");
        return;
      }
      const gotlegislators = await apiService.getLegislators(address, token);
      setSelectedState(gotlegislators[0].state);
      setLegislators(gotlegislators);
    } catch (error) {
      console.error("Error fetching legislators:", error);
    }
  };

  const handleFindReps = async () => {
    setFindReps(true);
    console.log(address);
    await getLegislators(address);
  };

  const components = {
    Header() {
      return (
        <div
          style={{
            color: "#6D28D9",
            fontSize: "24px",
            fontWeight: "600",
            textAlign: "center",
            padding: "20px 0",
          }}
        >
          Welcome to GeoPolicy
        </div>
      );
    },
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Authenticator
          components={components}
          className="[&_.amplify-card]:bg-white [&_.amplify-card]:shadow-xl [&_.amplify-card]:rounded-2xl [&_.amplify-card]:border-0 [&_.amplify-card]:p-8 [&_.amplify-button--primary]:bg-purple-600 [&_.amplify-button--primary]:hover:bg-purple-700 [&_.amplify-button--primary]:border-0 [&_.amplify-button--primary]:rounded-lg [&_.amplify-button--primary]:font-medium [&_.amplify-button--primary]:py-3 [&_.amplify-button--primary]:px-6 [&_.amplify-button--link]:text-purple-600 [&_.amplify-button--link]:hover:text-purple-700 [&_.amplify-button--link]:font-medium [&_.amplify-field]:mb-4 [&_.amplify-input]:border-gray-300 [&_.amplify-input]:rounded-lg [&_.amplify-input]:py-3 [&_.amplify-input]:px-4 [&_.amplify-input]:focus:border-purple-500 [&_.amplify-input]:focus:ring-2 [&_.amplify-input]:focus:ring-purple-200 [&_.amplify-label]:text-gray-700 [&_.amplify-label]:font-medium [&_.amplify-label]:mb-2 [&_.amplify-alert]:border-purple-200 [&_.amplify-alert]:bg-purple-50 [&_.amplify-alert]:text-purple-800 [&_.amplify-alert]:rounded-lg [&_.amplify-divider]:border-gray-200 [&_.amplify-divider-text]:bg-white [&_.amplify-divider-text]:text-gray-500 [&_.amplify-tabs]:border-gray-200 [&_.amplify-tabs-item]:text-gray-600 [&_.amplify-tabs-item]:border-transparent [&_.amplify-tabs-item--active]:text-purple-600 [&_.amplify-tabs-item--active]:border-purple-600"
        >
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to GeoPolicy
            </h2>
            <p className="text-gray-600 mb-6">
              Select your state to discover your representatives
            </p>

            <div className="mb-6">
              <label
                htmlFor="address-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Your Address
              </label>
              <input
                id="address-input"
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setFindReps(false);
                  setLegislators([]);
                }}
                placeholder="e.g., 1600 Pennsylvania Ave NW, Washington, DC 20500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-black bg-white"
              />
            </div>

            <button
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!address}
              onClick={handleFindReps}
            >
              Find My Representatives
            </button>

            {/* Display Legislators */}

            {legislators.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Senators from {selectedState}
                </h3>
                <div className="space-y-4">
                  {legislators.map((legislator, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <h4 className="font-bold text-gray-900 text-lg mb-3">
                          {legislator.name}
                        </h4>
                        <div className="mb-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              legislator.party === "Democrat"
                                ? "bg-blue-100 text-blue-800"
                                : legislator.party === "Republican"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {legislator.party}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          <p>State: {legislator.state}</p>
                          <p>Role: {legislator.Role}</p>
                          <p>Party: {legislator.party}</p>
                          {legislator.gender && (
                            <p>Gender: {legislator.gender}</p>
                          )}
                        </div>
                      </div>

                      {legislator.url && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <a
                            href={legislator.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 text-sm underline"
                          >
                            View Official Website
                          </a>
                        </div>
                      )}

                      {legislator.phone && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Phone: {legislator.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {legislators.length === 0 && findReps && (
              <div className="mt-8 border-t pt-6">
                <p className="text-gray-600 text-center">
                  No senators found for {selectedState}. Please try another
                  state.
                </p>
              </div>
            )}
          </div>
        </Authenticator>
      </div>
    </div>
  );
}
