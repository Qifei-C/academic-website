// lib/googleClient.ts
import { google } from "googleapis";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_CALENDAR_ID,
} = process.env;

function assertEnv() {
  const missing = [
    !GOOGLE_CLIENT_ID && "GOOGLE_CLIENT_ID",
    !GOOGLE_CLIENT_SECRET && "GOOGLE_CLIENT_SECRET",
    !GOOGLE_REDIRECT_URI && "GOOGLE_REDIRECT_URI",
    !GOOGLE_REFRESH_TOKEN && "GOOGLE_REFRESH_TOKEN",
    !GOOGLE_CALENDAR_ID && "GOOGLE_CALENDAR_ID",
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(`[googleClient] Missing env vars: ${missing.join(", ")}`);
  }
}

export function getOAuthClient() {
  assertEnv();
  const client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
  client.setCredentials({
    refresh_token: GOOGLE_REFRESH_TOKEN,
  });
  return client;
}

export async function getCalendar() {
  const auth = getOAuthClient();
  await auth.getAccessToken(); // ensure refresh works server-side
  return google.calendar({ version: "v3", auth });
}

export const calendarId = GOOGLE_CALENDAR_ID as string;
