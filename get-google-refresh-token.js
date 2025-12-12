/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * get-google-refresh-token.js
 *
 * Usage:
 *   (will auto-load .env.local/.env if present)
 *   GOOGLE_CLIENT_ID="xxx" \
 *   GOOGLE_CLIENT_SECRET="xxx" \
 *   GOOGLE_REDIRECT_URI="http://localhost:3000/api/oauth2callback" \
 *   node get-google-refresh-token.js "PASTE_AUTHORIZATION_CODE_HERE"
 *
 * This script exchanges an OAuth authorization code for:
 * - access_token
 * - refresh_token  ← YOU NEED THIS ONE
 */

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

// 解析命令行参数里的授权码
const authCode = process.argv[2];

// 先尝试加载 .env.local 或 .env，便于复用现有配置
function loadEnv() {
  const files = [".env.local", ".env"];
  for (const file of files) {
    const full = path.resolve(process.cwd(), file);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, "utf8");
    content.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (!match) return;
      const key = match[1];
      let val = match[2];
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    });
    break;
  }
}

loadEnv();

function writeRefreshToken(refreshToken) {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const exists = fs.existsSync(envPath);
  const content = exists ? fs.readFileSync(envPath, "utf8") : "";
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
  let updated = false;
  const nextLines = lines.map((line) => {
    if (line.match(/^\s*GOOGLE_REFRESH_TOKEN\s*=/)) {
      updated = true;
      return `GOOGLE_REFRESH_TOKEN=${refreshToken}`;
    }
    return line;
  });
  if (!updated) {
    nextLines.push(`GOOGLE_REFRESH_TOKEN=${refreshToken}`);
  }
  fs.writeFileSync(envPath, nextLines.join("\n"), "utf8");
  console.log(`\n💾 Wrote GOOGLE_REFRESH_TOKEN to ${envPath}`);
}

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
      writeRefreshToken(tokens.refresh_token);
      console.log("\n💾 Saved to .env.local (GOOGLE_REFRESH_TOKEN). Remember to restart your dev server.");
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
