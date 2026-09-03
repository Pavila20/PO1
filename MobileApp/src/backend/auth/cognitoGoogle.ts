import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import { Buffer } from "buffer";

const COGNITO_DOMAIN = process.env.EXPO_PUBLIC_COGNITO_DOMAIN!;
const COGNITO_CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID!;
const REDIRECT_URI = process.env.EXPO_PUBLIC_REDIRECT_URI!;


function base64URLEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function sha256ToBase64Url(input: string) {
  const digestB64 = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input, { encoding: Crypto.CryptoEncoding.BASE64 });
  return digestB64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function signInWithGoogle() {
  const state = base64URLEncode(Buffer.from(Crypto.getRandomBytes(16)));
  const codeVerifier = base64URLEncode(Buffer.from(Crypto.getRandomBytes(32)));
  const codeChallenge = await sha256ToBase64Url(codeVerifier);

  await SecureStore.setItemAsync("pkce_state", state);
  await SecureStore.setItemAsync("pkce_code_verifier", codeVerifier);

  const authUrl =
    `https://${COGNITO_DOMAIN}/oauth2/authorize?` +
    `identity_provider=Google&` +
    `response_type=code&` +
    `client_id=${COGNITO_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent("openid email profile")}&` +
    `state=${state}&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256`;

const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);
console.log("AUTH RESULT:", result);


  if (result.type !== "success") throw new Error("Login cancelled/failed");

  const url = new URL(result.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  const storedState = await SecureStore.getItemAsync("pkce_state");
  if (!code) throw new Error("No auth code returned");
  if (returnedState !== storedState) throw new Error("State mismatch");

  return exchangeCodeForTokens(code);
}

async function exchangeCodeForTokens(code: string) {
  const codeVerifier = await SecureStore.getItemAsync("pkce_code_verifier");
  if (!codeVerifier) throw new Error("Missing code_verifier");

  const tokenUrl = `https://${COGNITO_DOMAIN}/oauth2/token`;

  const body = new URLSearchParams();
  body.append("grant_type", "authorization_code");
  body.append("client_id", COGNITO_CLIENT_ID);
  body.append("code", code);
  body.append("redirect_uri", REDIRECT_URI);
  body.append("code_verifier", codeVerifier);

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${text}`);

  const tokens = JSON.parse(text);

  if (tokens.id_token) await SecureStore.setItemAsync("id_token", tokens.id_token);
  if (tokens.access_token) await SecureStore.setItemAsync("access_token", tokens.access_token);
  if (tokens.refresh_token) await SecureStore.setItemAsync("refresh_token", tokens.refresh_token);

  return tokens;
}

export async function signOutLocal() {
  await SecureStore.deleteItemAsync("id_token");
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
}
