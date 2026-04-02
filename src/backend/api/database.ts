// backendtest/PO1/src/api/database.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { BrewRating, PourProfile } from "../../models/types";
import { getSessionToken } from "../auth/session"; // We need the user's JWT token

// ⚠️ IMPORTANT: Replace these with your actual AWS details!
const REGION = "us-east-2"; // Or your specific region
const IDENTITY_POOL_ID = "us-east-2:5a926248-5ae6-4275-8548-58335d22403b"; // Get this from your Cognito Identity Pool page
const USER_POOL_ID = "us-east-2_CnG8VLtPr"; // Get this from your Cognito User Pool page

// Helper to initialize an authenticated DynamoDB Client dynamically
const getDynamoClient = async () => {
  // 1. Get the logged-in user's JWT token
  const jwtToken = await getSessionToken();
  if (!jwtToken) throw new Error("No user token found.");

  // 2. Exchange the JWT token for temporary IAM Database credentials
  const credentials = fromCognitoIdentityPool({
    identityPoolId: IDENTITY_POOL_ID,
    logins: {
      [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: jwtToken,
    },
    clientConfig: { region: REGION },
  });

  // 3. Create and return the client
  const client = new DynamoDBClient({
    region: REGION,
    credentials: credentials,
  });

  return DynamoDBDocumentClient.from(client);
};

const PROFILES_TABLE = "PO1_PourProfiles";
const RATINGS_TABLE = "PO1_BrewRatings";

// --- POUR PROFILE FUNCTIONS ---

export const savePourProfile = async (
  profile: any, // Changed to 'any' to easily accept our custom IDs
) => {
  const docClient = await getDynamoClient();
  const newProfile: PourProfile = {
    ...profile,
    // THE FIX: Use the ID we passed, or generate a new one if it's missing!
    profileId: profile.profileId ? profile.profileId : uuidv4(),
    createdAt: profile.createdAt ? profile.createdAt : new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: PROFILES_TABLE,
    Item: newProfile,
  });

  await docClient.send(command);
  return newProfile;
};

export const getUserProfiles = async (userId: string) => {
  const docClient = await getDynamoClient();
  const command = new QueryCommand({
    TableName: PROFILES_TABLE,
    IndexName: "UserIdIndex",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  });

  const response = await docClient.send(command);
  return (response.Items || []) as PourProfile[];
};

export const deletePourProfile = async (profileId: string) => {
  const docClient = await getDynamoClient();
  const command = new DeleteCommand({
    TableName: PROFILES_TABLE,
    Key: {
      profileId: profileId,
    },
  });
  await docClient.send(command);
};

// --- RATING & FEEDBACK FUNCTIONS ---

export const saveBrewRating = async (
  ratingData: Omit<BrewRating, "ratingId" | "timestamp">,
) => {
  const docClient = await getDynamoClient();
  const newRating: BrewRating = {
    ...ratingData,
    ratingId: uuidv4(),
    timestamp: new Date().toISOString(),
  };

  const command = new PutCommand({
    TableName: RATINGS_TABLE,
    Item: newRating,
  });

  await docClient.send(command);
  return newRating;
};
