// src/auth/session.ts

import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

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
  // We grab the ID token (JWT) to use as the VIP pass for AWS DynamoDB
  return await SecureStore.getItemAsync(KEY_ID);
}
