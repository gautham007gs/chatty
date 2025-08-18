import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// -----------------------------------------------------------------------------
// Genkit AI Initialization with Google AI (Gemini)
// -----------------------------------------------------------------------------

// Function to determine the API key to use at initialization.
// It checks environment variables in a prioritized order.
// An API key is typically a long alphanumeric string.
const MIN_API_KEY_LENGTH = 30; // Most Google API keys are around 39 characters.

const getApiKey = (): string | undefined => {
  // Check multiple possible environment variable names for Gemini API key
const possibleApiKeyNames = [
  'GEMINI_API_KEY',
  'GOOGLE_API_KEY',
  'GEMINI_API_KEY_1',
  'GEMINI_API_KEY_2',
  'GEMINI_API_KEY_3',
  'GEMINI_API_KEY_4',
  'GEMINI_API_KEY_5'
];

let geminiApiKey: string | undefined;
for (const keyName of possibleApiKeyNames) {
  console.log(`Genkit: Checking environment variable: ${keyName}`);
  const keyValue = process.env[keyName];
  if (keyValue && keyValue.trim() !== '' && keyValue.length > 10 && !keyValue.toLowerCase().includes('your') && !keyValue.toLowerCase().includes('api') && !keyValue.toLowerCase().includes('key')) {
    geminiApiKey = keyValue.trim();
    console.log(`Genkit: Found valid API key in ${keyName}`);
    break;
  } else {
    console.log(`Genkit: Environment variable ${keyName} is not set.`);
  }
}

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!! HEY! IF YOU ARE IN FIREBASE STUDIO AND process.env ISN'T WORKING  !!!
  // !!! YOU CAN TEMPORARILY HARDCODE YOUR KEY HERE FOR TESTING.           !!!
  // !!!                                                                     !!!
  // !!! **CRITICAL**: DO NOT COMMIT THIS HARDCODED KEY TO GIT OR DEPLOY IT! !!!
  // !!! REMOVE IT OR COMMENT IT OUT BEFORE PUSHING TO GITHUB/VERCEL!        !!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const studioDevApiKey = "YOUR_GEMINI_API_KEY_HERE_FOR_STUDIO_TESTING"; // <<<<<<< REPLACE THIS WITH YOUR ACTUAL KEY FOR STUDIO
  if (!geminiApiKey && studioDevApiKey && studioDevApiKey !== "YOUR_GEMINI_API_KEY_HERE_FOR_STUDIO_TESTING" && studioDevApiKey.length >= MIN_API_KEY_LENGTH) {
      console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.warn("!!! Genkit: WARNING! Using TEMPORARY hardcoded API key for Firebase Studio testing.        !!!");
      console.warn("!!! This is NOT secure for production. REMOVE before committing or deploying!              !!!");
      console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      return studioDevApiKey;
  }

  if (!geminiApiKey) {
      console.error(
        "CRITICAL Genkit Error: No valid Gemini API Key found for initialization. " +
        "All checked environment variables (GEMINI_API_KEY, GOOGLE_API_KEY, etc.) " +
        "are undefined, empty, too short, or appear invalid. AI features will NOT work. " +
        "Please ensure at least one valid API key is correctly set in your environment variables " +
        "OR for Firebase Studio testing, temporarily hardcode it in src/ai/genkit.ts (and remove before commit/deploy)."
      );
  }

  return geminiApiKey;
};

const activeApiKey = getApiKey();

if (!activeApiKey) {
  console.error("Genkit: AI plugin NOT initialized due to missing valid API key. AI functionalities will be disabled.");
}

export const ai = genkit({
  plugins: activeApiKey ?
    [
      googleAI({
        apiKey: activeApiKey,
      }),
    ] :
    [], // Initialize with no plugins if no valid API key is found
  model: 'googleai/gemini-1.5-flash-latest', // Default model
});


// --- VERY IMPORTANT NOTES ON API KEY MANAGEMENT ---
//
// 1.  **ENVIRONMENT VARIABLES ARE PREFERRED:**
//     This file is designed to read API keys from environment variables
//     (e.g., `GOOGLE_API_KEY`, `GEMINI_API_KEY_1`) which are set in your
//     hosting environment (like Vercel) or a local `.env` file.
//
// 2.  **FIREBASE STUDIO TESTING (Temporary Hardcoding):**
//     If `process.env` variables are not available in your current Firebase Studio
//     session, a temporary fallback to a hardcoded `studioDevApiKey` has been added above.
//     YOU MUST:
//         a. REPLACE `"YOUR_GEMINI_API_KEY_HERE_FOR_STUDIO_TESTING"` with your actual key.
//         b. **CRITICAL:** REMOVE or comment out this hardcoded key before committing
//            your code to Git or deploying to any production/staging environment.
//            Exposing API keys in version control is a major security risk.
//
// 3.  **INITIALIZATION-TIME KEY SELECTION ONLY:**
//     The `getApiKey` function selects ONE API key when your application
//     STARTS or is (RE)DEPLOYED.
//
// 4.  **NO AUTOMATIC RUNTIME FAILOVER OR SWITCHING:**
//     If the API key that was active at startup becomes
//     exhausted, invalid, or hits quota limits WHILE THE APP IS RUNNING,
//     Genkit calls using that key WILL START FAILING.
//     The application **WILL NOT AUTOMATICALLY** try another key at that point.
//
// 5.  **MANUAL INTERVENTION REQUIRED FOR RUNTIME FAILURES (in deployed environments):**
//     If your active key fails during runtime (e.g., due to quota or it being revoked):
//     a.  You need to **UPDATE YOUR ENVIRONMENT VARIABLES** in your hosting provider
//         (e.g., Vercel) or local .env file to point to a working key.
//     b.  You **MUST THEN REDEPLOY OR RESTART** your application.
//
// 6.  **CHECK THE LOGS AT STARTUP:**
//     The `getApiKey` function logs which key source it's using or if it
//     finds an invalid-looking key, or if no key is found. Check your server startup logs
//     (Vercel deployment logs or your local `npm run dev` terminal output, or Firebase Studio console)
//     to see what API key decision is being made.
//
// If the logs show "CRITICAL Genkit Error: No valid Gemini API Key found...",
// and you haven't hardcoded `studioDevApiKey` for Studio testing, then NO API KEY
// IS BEING PASSED TO THE GOOGLE AI PLUGIN.
// The `ai` object will be initialized with no plugins in that case,
// and any call to `ai.generate()` will likely fail.