"use client";
import { fetchAuthSession } from "aws-amplify/auth";

export type TokenBundle = {
  accessToken: string | null;
  idToken: string | null;
};

export async function getTokens() {
  try {
    const session = await fetchAuthSession();
    if (session.tokens) {
      return session.tokens.accessToken.toString();
    } else {
      console.log("No tokens available");
      return null;
    }
  } catch (error) {
    console.error("Error getting tokens:", error);
    return null;
  }
}
