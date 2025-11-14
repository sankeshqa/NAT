// setupAllure.js
import fs from 'fs';
import path from 'path';

const allureResultsDir = './allure-results';

// Create the allure-results directory if it doesn't exist
if (!fs.existsSync(allureResultsDir)) {
  fs.mkdirSync(allureResultsDir);
}

// 👉 Write environment.properties
fs.writeFileSync(path.join(allureResultsDir, 'environment.properties'), `
Browser=Chromium
BaseURL=https://nat.tiuconsulting.us
Environment=QA
Tester=Sankesh
RunTime=${new Date().toLocaleString()}
`);

// 👉 Write executor.json
fs.writeFileSync(path.join(allureResultsDir, 'executor.json'), JSON.stringify({
  name: 'Local Machine',
  type: 'local',
  url: 'http://localhost',
  buildName: 'Playwright Test Run',
  buildOrder: 1,
  buildUrl: 'http://localhost/run/1'
}, null, 2));

console.log('✅ Allure metadata files generated successfully.');