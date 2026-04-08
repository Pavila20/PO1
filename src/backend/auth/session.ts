// src/auth/session.ts

import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { refreshSession } from "./emailPassword";
const KEY_ID = "id_token";
const KEY_ACCESS = "access_token";
const KEY_REFRESH = "refresh_token";

export type SessionUser = {
  email?: string;
  sub?: string;
  cognitoUsername?: string;
  name?: string;
  given_name?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const idToken = await SecureStore.getItemAsync(KEY_ID);
  if (!idToken) return null;

  const payload: any = jwtDecode(idToken);
  return {
    email: payload.email,
    sub: payload.sub,
    cognitoUsername: payload["cognito:username"],
    name: payload.name,
    given_name: payload.given_name,
  };
}

export async function isLoggedIn(): Promise<boolean> {
  const access = await SecureStore.getItemAsync(KEY_ACCESS);
  return !!access;
}

export async function signOutLocal() {
  await SecureStore.deleteItemAsync(KEY_ID);
  await SecureStore.deleteItemAsync(KEY_ACCESS);
  await SecureStore.deleteItemAsync(KEY_REFRESH);
}
export async function getSessionToken(): Promise<string | null> {
  let idToken = await SecureStore.getItemAsync(KEY_ID);
  if (!idToken) return null;

  try {
    const payload: any = jwtDecode(idToken);
    const currentTime = Math.floor(Date.now() / 1000);

    // If the token expires in less than 5 minutes (300 seconds), refresh it
    if (payload.exp && payload.exp - 300 < currentTime) {
      console.log("Token expired or expiring soon. Refreshing...");
      idToken = await refreshSession();

      if (!idToken) throw new Error("Failed to get a new ID token");
    }
  } catch (error) {
    console.error("Failed to decode or refresh token:", error);
    // If the refresh token is also expired (usually after 30 days) or revoked,
    // automatically clear out the local storage so the user is forced to log in again.
    await signOutLocal();
    return null;
  }

  return idToken;
}
