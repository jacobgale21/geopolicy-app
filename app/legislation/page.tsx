"use client";

import { useEffect, useState } from "react";
import { getTokens } from "../utils/tokens";
import { apiService } from "../api";

interface RecentLegislationItem {
  bill_id: string;
  chamber: string;
  date: string;
  title: string;
  action: string;
}

export default function LegislationPage() {
  const [items, setItems] = useState<RecentLegislationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true);
      setError("");
      try {
        const token = await getTokens();
        if (!token) {
          setError("You must be signed in to view legislation.");
          return;
        }
        const data = await apiService.getRecentLegislation(token);
        console.log(data);
        const items: RecentLegislationItem[] = data.map(
          (item: {
            bill_id: string;
            chamber: string;
            date: string;
            title: string;
            action: string;
          }) => ({
            bill_id: item["bill_id"],
            chamber: item["chamber"],
            date: item["date"],
            title: item["title"],
            action: item["action"],
          })
        );
        setItems(items);
      } catch (e) {
        setError("Failed to fetch recent legislation. Please try again.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 p-6 pt-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recent Congressional Actions
          </h1>
          <p className="text-gray-600">
            Latest 10 actions across the House and Senate
          </p>
        </div>

        {loading && (
          <div className="bg-white border border-gray-200 rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recent legislation...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="grid grid-cols-1 gap-4">
              {items.map((item, idx) => (
                <div
                  key={`${item.bill_id}-${item.date}-${idx}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title || "Untitled Bill"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Bill:</span>{" "}
                      {item.bill_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">
                        Chamber:
                      </span>{" "}
                      {item.chamber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Date:</span>{" "}
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-3">
                    <p className="text-gray-800">
                      <span className="font-medium text-gray-700">Action:</span>{" "}
                      {item.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-6 text-center">
            <p className="text-yellow-800">
              No recent congressional actions were found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
