"use client";
import { Amplify } from "aws-amplify";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import awsExports from "../../src/aws-exports";
import "@aws-amplify/ui-react/styles.css";
import { apiService, Legislator } from "../api";
import { seedUsAveragesCache } from "../utils/usCensusCache";
import { useState, useEffect } from "react";
import { useAddress } from "../context/AddressContext";
import { useRouter } from "next/navigation";
import { Hub } from "aws-amplify/utils";

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

export default function StartPage() {
  const [legislators, setLegislators] = useState<Legislator[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [findReps, setFindReps] = useState<boolean>(false);
  const { address, setAddress, setState } = useAddress();
  const [loading, setLoading] = useState<boolean>(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [showInterests, setShowInterests] = useState<boolean>(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const router = useRouter();

  // Seed US averages cache once the user is authenticated and page renders on client
  // Authenticator wraps this page, so render implies signed in; additionally guard with getCurrentUser
  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        seedUsAveragesCache([2021, 2022, 2023]);
      } catch {
        // not signed in; do nothing
      }
    })();
  }, []);

  // Listen for auth events to detect new user signups
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", (data) => {
      const { payload } = data;

      switch (payload.event) {
        case "signedIn":
          // Check if this is a new user signing in for the first time
          const isNewUserFlag = localStorage.getItem("isNewUser") === "true";
          if (isNewUserFlag) {
            console.log("New user signing in for first time");
            setIsNewUser(true);
            setShowInterests(true);
          }
          console.log("isNewUserFlag", isNewUserFlag);
          break;
        case "signedOut":
          // Clear new user flag when signing out
          localStorage.removeItem("isNewUser");
          setIsNewUser(false);
          setShowInterests(false);
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  const getLegislators = async (address: string) => {
    try {
      setLoading(true);
      const token = await getTokens();
      if (!token) {
        console.error("No token available");
        return;
      }
      const gotlegislators = await apiService.getLegislators(address, token);
      setSelectedState(gotlegislators[0].state);
      setState(gotlegislators[0].state);
      setLegislators(gotlegislators);
    } catch (error) {
      console.error("Error fetching legislators:", error);
    }
    setLoading(false);
  };

  const handleFindReps = async () => {
    setFindReps(true);
    await getLegislators(address);
  };

  const handleContinue = () => {
    // Navigate to the main app page after setting up representatives
    router.push("/");
  };

  // Handle interest selection for new users
  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleInterestsComplete = async () => {
    try {
      // Save interests to database (you'll need to implement this API endpoint)
      const token = await getTokens();
      if (token) {
        // TODO: Implement saveUserInterests API call
        // await apiService.saveUserInterests(selectedInterests, token);
        console.log("Saving interests:", selectedInterests);
      }

      // Clear new user flag and hide interests
      localStorage.removeItem("isNewUser");
      setIsNewUser(false);
      setShowInterests(false);
      setSelectedInterests([]);
    } catch (error) {
      console.error("Error saving interests:", error);
    }
  };

  // Political interests data
  const politicalInterests = [
    { id: "healthcare", name: "Healthcare", icon: "🏥" },
    { id: "education", name: "Education", icon: "🎓" },
    { id: "economy", name: "Economy", icon: "📈" },
    { id: "environment", name: "Environment", icon: "🌱" },
    { id: "defense", name: "Defense", icon: "🛡️" },
    { id: "immigration", name: "Immigration", icon: "🌍" },
    { id: "taxes", name: "Taxes", icon: "💰" },
    { id: "social", name: "Social Issues", icon: "🤝" },
    { id: "energy", name: "Energy", icon: "⚡" },
    { id: "foreign", name: "Foreign Policy", icon: "🌐" },
  ];

  // Show interests selection for new users
  if (showInterests) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              What are your political interests?
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Select 3-5 topics to personalize your GeoPolicy experience
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {politicalInterests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedInterests.includes(interest.id)
                      ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span className="text-3xl mb-2 block">{interest.icon}</span>
                  <span className="font-medium text-sm">{interest.name}</span>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleInterestsComplete}
                disabled={
                  selectedInterests.length < 3 || selectedInterests.length > 5
                }
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Continue ({selectedInterests.length} selected)
              </button>
              {selectedInterests.length < 3 && (
                <p className="text-sm text-gray-500 mt-2">
                  Please select at least 3 interests
                </p>
              )}
              {selectedInterests.length > 5 && (
                <p className="text-sm text-gray-500 mt-2">
                  Please select no more than 5 interests
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4 pt-14">
      <div className="w-full max-w-2xl">
        <Authenticator
          components={components}
          className="[&_.amplify-card]:bg-white [&_.amplify-card]:shadow-xl [&_.amplify-card]:rounded-2xl [&_.amplify-card]:border-0 [&_.amplify-card]:p-8 [&_.amplify-button--primary]:bg-purple-600 [&_.amplify-button--primary]:hover:bg-purple-700 [&_.amplify-button--primary]:border-0 [&_.amplify-button--primary]:rounded-lg [&_.amplify-button--primary]:font-medium [&_.amplify-button--primary]:py-3 [&_.amplify-button--primary]:px-6 [&_.amplify-button--link]:text-purple-600 [&_.amplify-button--link]:hover:text-purple-700 [&_.amplify-button--link]:font-medium [&_.amplify-field]:mb-4 [&_.amplify-input]:border-gray-300 [&_.amplify-input]:rounded-lg [&_.amplify-input]:py-3 [&_.amplify-input]:px-4 [&_.amplify-input]:focus:border-purple-500 [&_.amplify-input]:focus:ring-2 [&_.amplify-input]:focus:ring-purple-200 [&_.amplify-label]:text-gray-700 [&_.amplify-label]:font-medium [&_.amplify-label]:mb-2 [&_.amplify-alert]:border-purple-200 [&_.amplify-alert]:bg-purple-50 [&_.amplify-alert]:text-purple-800 [&_.amplify-alert]:rounded-lg [&_.amplify-divider]:border-gray-200 [&_.amplify-divider-text]:bg-white [&_.amplify-divider-text]:text-gray-500 [&_.amplify-tabs]:border-gray-200 [&_.amplify-tabs-item]:text-gray-600 [&_.amplify-tabs-item]:border-transparent [&_.amplify-tabs-item--active]:text-purple-600 [&_.amplify-tabs-item--active]:border-purple-600"
        >
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to GeoPolicy
            </h2>
            <p className="text-gray-600 mb-6">
              Discover your representatives and state statistics
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
              disabled={!address || loading}
              onClick={handleFindReps}
            >
              Find My Representatives
            </button>

            {/* Display Legislators */}
            {loading && (
              <div className="mt-8 border-t pt-6">
                <p className="text-gray-600 text-center">Loading...</p>
              </div>
            )}
            {legislators.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Senators from {selectedState}
                </h3>
                <div className="space-y-4">
                  {legislators.map((legislator, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-6 shadow-lg"
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

                {/* Continue Button */}
                <div className="mt-6">
                  <button
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium"
                    onClick={handleContinue}
                  >
                    Continue to Dashboard
                  </button>
                </div>
              </div>
            )}

            {!loading && legislators.length === 0 && findReps && (
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
