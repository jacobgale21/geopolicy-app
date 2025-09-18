"use client";
import { useEffect } from "react";
import { Amplify } from "aws-amplify";
import awsExports from "../../src/aws-exports";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(awsExports);
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
export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    try {
      Amplify.configure(awsExports);
    } catch {}
  }, []);

  return (
    <Authenticator
      components={components}
      className="[&_.amplify-card]:bg-white [&_.amplify-card]:shadow-xl [&_.amplify-card]:rounded-2xl [&_.amplify-card]:border-0 [&_.amplify-card]:p-8 [&_.amplify-button--primary]:bg-purple-600 [&_.amplify-button--primary]:hover:bg-purple-700 [&_.amplify-button--primary]:border-0 [&_.amplify-button--primary]:rounded-lg [&_.amplify-button--primary]:font-medium [&_.amplify-button--primary]:py-3 [&_.amplify-button--primary]:px-6 [&_.amplify-button--link]:text-purple-600 [&_.amplify-button--link]:hover:text-purple-700 [&_.amplify-button--link]:font-medium [&_.amplify-field]:mb-4 [&_.amplify-input]:border-gray-300 [&_.amplify-input]:rounded-lg [&_.amplify-input]:py-3 [&_.amplify-input]:px-4 [&_.amplify-input]:focus:border-purple-500 [&_.amplify-input]:focus:ring-2 [&_.amplify-input]:focus:ring-purple-200 [&_.amplify-label]:text-gray-700 [&_.amplify-label]:font-medium [&_.amplify-label]:mb-2 [&_.amplify-alert]:border-purple-200 [&_.amplify-alert]:bg-purple-50 [&_.amplify-alert]:text-purple-800 [&_.amplify-alert]:rounded-lg [&_.amplify-divider]:border-gray-200 [&_.amplify-divider-text]:bg-white [&_.amplify-divider-text]:text-gray-500 [&_.amplify-tabs]:border-gray-200 [&_.amplify-tabs-item]:text-gray-600 [&_.amplify-tabs-item]:border-transparent [&_.amplify-tabs-item--active]:text-purple-600 [&_.amplify-tabs-item--active]:border-purple-600"
    >
      {children}
    </Authenticator>
  );
}
