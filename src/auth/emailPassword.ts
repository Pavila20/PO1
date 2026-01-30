import * as SecureStore from "expo-secure-store";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const REGION = process.env.EXPO_PUBLIC_AWS_REGION!;
const USER_POOL_CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID!;


const cip = new CognitoIdentityProviderClient({ region: REGION });

// Same keys you already use everywhere
const KEY_ID = "id_token";
const KEY_ACCESS = "access_token";
const KEY_REFRESH = "refresh_token";

export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isStrongPassword(v: string) {
  // 8+ chars, number, lower, upper, special
  return /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/.test(v);
}

export async function signUpEmailPassword(email: string, password: string, name?: string) {
  email = email.trim().toLowerCase();

  if (!isValidEmail(email)) throw new Error("Enter a valid email.");
  if (!isStrongPassword(password)) {
    throw new Error("Password must be 8+ chars and include upper/lower/number/special.");
  }

  const cmd = new SignUpCommand({
    ClientId: USER_POOL_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }, ...(name ? [{ Name: "name", Value: name }] : [])],
  });

  return cip.send(cmd);
}

export async function confirmSignUp(email: string, code: string) {
  email = email.trim().toLowerCase();
  code = code.trim();

  const cmd = new ConfirmSignUpCommand({
    ClientId: USER_POOL_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  });

  return cip.send(cmd);
}

export async function resendConfirmationCode(email: string) {
  email = email.trim().toLowerCase();

  const cmd = new ResendConfirmationCodeCommand({
    ClientId: USER_POOL_CLIENT_ID,
    Username: email,
  });

  return cip.send(cmd);
}

export async function signInEmailPassword(email: string, password: string) {
  email = email.trim().toLowerCase();

  const cmd = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: USER_POOL_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  const out = await cip.send(cmd);
  const result = out.AuthenticationResult;

  if (!result?.IdToken || !result?.AccessToken) {
    throw new Error("Login failed: missing tokens.");
  }

  await SecureStore.setItemAsync(KEY_ID, result.IdToken);
  await SecureStore.setItemAsync(KEY_ACCESS, result.AccessToken);
  if (result.RefreshToken) await SecureStore.setItemAsync(KEY_REFRESH, result.RefreshToken);

  return result;
}

export async function forgotPasswordRequest(email: string) {
  email = email.trim().toLowerCase();

  const cmd = new ForgotPasswordCommand({
    ClientId: USER_POOL_CLIENT_ID,
    Username: email,
  });

  return cip.send(cmd);
}

export async function forgotPasswordConfirm(email: string, code: string, newPassword: string) {
  email = email.trim().toLowerCase();
  code = code.trim();

  const cmd = new ConfirmForgotPasswordCommand({
    ClientId: USER_POOL_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  });

  return cip.send(cmd);
}
