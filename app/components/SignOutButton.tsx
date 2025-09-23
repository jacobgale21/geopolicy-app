"use client";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      // Redirect to start page after signing out
      router.push("/start_page");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="group relative flex items-center gap-2 px-3 py-2 rounded-md border-transparent hover:border-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
      title="Sign Out"
    >
      <span className="text-xl" aria-hidden>
        🚪
      </span>
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 shadow">
        Sign Out
      </span>
    </button>
  );
}
