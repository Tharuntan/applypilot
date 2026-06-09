/*
 * Injects the production API base URL into environment.ts at build time.
 * Reads API_BASE_URL from the environment (set in Netlify). No-op if unset.
 *
 * Usage (run before `npm run build`):  node scripts/set-prod-api.js
 */
const fs = require('fs');
const path = require('path');

const apiBaseUrl = process.env.API_BASE_URL;
const file = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');

if (!apiBaseUrl) {
  console.log('[set-prod-api] API_BASE_URL not set — keeping default environment.ts');
  process.exit(0);
}

const contents = `// Generated at build time by scripts/set-prod-api.js
export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl}',
};
`;

fs.writeFileSync(file, contents);
console.log(`[set-prod-api] environment.ts -> apiBaseUrl = ${apiBaseUrl}`);
