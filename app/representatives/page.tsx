"use client";

import { useEffect, useState } from "react";
import { getTokens } from "../utils/tokens";
import { apiService, Legislator } from "../api";
import { useAddress } from "../context/AddressContext";
import { useRouter } from "next/navigation";

export default function RepresentativesPage() {
  const [legislators, setLegislators] = useState<Legislator[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [findReps, setFindReps] = useState<boolean>(false);
  const { address, setAddress, setState } = useAddress();
  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    (async () => {
      const token = await getTokens();
      if (token) {
        setToken(token);
      }
    })();
  }, []);

  const getLegislators = async (address: string) => {
    try {
      setLoading(true);
      if (token) {
        const gotlegislators = await apiService.getLegislators(address, token);
        console.log(gotlegislators);
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4 pt-14">
      <div className="w-full max-w-2xl">
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
                        {legislator.Nominate_Score && (
                          <p>Nominate Score: {legislator.Nominate_Score}</p>
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

          {!loading && legislators.length === 0 && findReps && (
            <div className="mt-8 border-t pt-6">
              <p className="text-gray-600 text-center">
                No senators found for {selectedState}. Please try another state.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
