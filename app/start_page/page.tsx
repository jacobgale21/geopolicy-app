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
import { getTokens } from "../utils/tokens";
Amplify.configure(awsExports);

export default function StartPage() {
  const [legislators, setLegislators] = useState<Legislator[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [findReps, setFindReps] = useState<boolean>(false);
  const { address, setAddress, setState } = useAddress();
  const [loading, setLoading] = useState<boolean>(false);
  const [showInterests, setShowInterests] = useState<boolean>(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [token, setToken] = useState<string>("");
  const router = useRouter();

  // Seed US averages cache once the user is authenticated and page renders on client
  // Authenticator wraps this page, so render implies signed in; additionally guard with getCurrentUser
  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        const token = await getTokens();
        setToken(token ? token : "");
        if (token != "") {
          const interests = await apiService.getUserInterests(
            token ? token : ""
          );
          if (interests["interests"].length > 0) {
            setSelectedInterests(interests["interests"]);
            setShowInterests(false);
          } else {
            setShowInterests(true);
          }
        }
        // Send user id token and access token to backend to check if interests are already set, if not, then show interests selection
        seedUsAveragesCache([2021, 2022, 2023]);
      } catch {
        // not signed in; do nothing
      }
    })();
  }, []);

  const getLegislators = async (address: string) => {
    try {
      setLoading(true);
      if (token != "") {
        const gotlegislators = await apiService.getLegislators(address, token);
        setSelectedState(gotlegislators[0].state);
        setState(gotlegislators[0].state);
        setLegislators(gotlegislators);
      }
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
    // Navigate to the dashboard after setting up representatives
    router.push("/dashboard");
  };

  const handleInterestsComplete = async () => {
    try {
      // Save interests to database
      if (token != "") {
        const interest = await apiService.saveUserInterests(
          token,
          selectedInterests
        );
        setShowInterests(false);
        // Redirect to dashboard after saving interests
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error saving interests:", error);
    }
  };

  const addInterests = (newItem: string) => {
    setSelectedInterests((prev) => [...prev, newItem]);
  };
  const isInterest = (interest: string) => {
    return selectedInterests.includes(interest);
  };
  // Political interests data
  // const politicalInterests = [
  //   { id: "healthcare", name: "Healthcare", icon: "🏥" },
  //   { id: "education", name: "Education", icon: "🎓" },
  //   { id: "economy", name: "Economy", icon: "📈" },
  //   { id: "environment", name: "Environment", icon: "🌱" },
  //   { id: "defense", name: "Defense", icon: "🛡️" },
  //   { id: "immigration", name: "Immigration", icon: "🌍" },
  //   { id: "taxes", name: "Taxes", icon: "💰" },
  //   { id: "social", name: "Social Issues", icon: "🤝" },
  //   { id: "energy", name: "Energy", icon: "⚡" },
  //   { id: "foreign", name: "Foreign Policy", icon: "🌐" },
  // ];
  const politicalInterests = [
    { id: "state_stats", name: "State Stats", icon: "🏡" },
    { id: "legislation", name: "Legislation", icon: "🏛️" },
    { id: "federal_spending", name: "Federal Spending", icon: "💵" },
    { id: "federal_debt", name: "Federal Debt", icon: "" },
    { id: "crime", name: "Crime", icon: "🛡️" },
    { id: "health", name: "Health", icon: "🏥" },
    { id: "taxes", name: "Taxes", icon: "💸" },
    { id: "federal_economic", name: "Federal Economics", icon: "💰" },
  ];

  // Show interests selection for new users
  console.log(showInterests);
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
                  onClick={() => addInterests(interest.name)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedInterests
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
}
