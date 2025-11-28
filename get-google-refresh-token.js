/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * get-google-refresh-token.js
 *
 * Usage:
 *   GOOGLE_CLIENT_ID="xxx" \
 *   GOOGLE_CLIENT_SECRET="xxx" \
 *   GOOGLE_REDIRECT_URI="http://localhost:3000/api/oauth2callback" \
 *   node get-google-refresh-token.js "PASTE_AUTHORIZATION_CODE_HERE"
 *
 * This script exchanges an OAuth authorization code for:
 * - access_token
 * - refresh_token  ← YOU NEED THIS ONE
 */

const { google } = require("googleapis");

// 解析命令行参数里的授权码
const authCode = process.argv[2];

if (!authCode) {
  console.error(`
⚠ ERROR: Missing authorization code.

Run it like this:

GOOGLE_CLIENT_ID="your-client-id" \\
GOOGLE_CLIENT_SECRET="your-client-secret" \\
GOOGLE_REDIRECT_URI="http://localhost:3000/api/oauth2callback" \\
node get-google-refresh-token.js "PASTE_CODE_HERE"
`);
  process.exit(1);
}

// 从环境变量读取 OAuth credentials
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.error(`
❌ Missing required environment variables.

You must set:

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI

Example:

GOOGLE_CLIENT_ID="xxx" \\
GOOGLE_CLIENT_SECRET="xxx" \\
GOOGLE_REDIRECT_URI="http://localhost:3000/api/oauth2callback" \\
node get-google-refresh-token.js "AUTH_CODE"
`);
  process.exit(1);
}

async function main() {
  try {
    console.log("⏳ Creating OAuth2 client...");
    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    console.log("⏳ Exchanging authorization code for tokens...");

    const { tokens } = await oAuth2Client.getToken(authCode);

    console.log("\n🎉 Tokens received from Google:\n");
    console.log(JSON.stringify(tokens, null, 2));

    if (tokens.refresh_token) {
      console.log("\n✅ Your refresh_token is:\n");
      console.log(tokens.refresh_token);
      console.log("\n💾 Save this refresh_token in your .env.local or Vercel env vars.");
    } else {
      console.log(`
⚠ No refresh_token returned.

Possible fixes:
1. Add '&access_type=offline&prompt=consent' to your authorization URL.
2. Make sure this is the FIRST time authorizing with this client.
3. Try revoking previous authorizations:
   https://myaccount.google.com/permissions
4. Or create a NEW OAuth client in Google Cloud Console and try again.
`);
    }
  } catch (err) {
    console.error("\n❌ Error exchanging code for tokens:\n");
    console.error(err.response?.data || err.message || err);
  }
}

main();
