"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard (which will handle authentication and setup)
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4 pt-14">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Redirecting to GeoPolicy...
        </h1>
        <p className="text-gray-600">
          Please wait while we redirect you to the start page.
        </p>
      </div>
    </div>
  );
}
