import { test as base, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export const test = base.extend({
  page: async ({ browser }, use, testInfo) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    let tracingStarted = false;

    // Start tracing
    try {
      await context.tracing.start({
        screenshots: true,
        snapshots: true,
      });
      tracingStarted = true;
    } catch (err) {
      console.warn('⚠️ Failed to start tracing:', err.message);
    }

    // Perform login
    await page.goto('https://nat.tiuconsulting.us/users/login?redirect=%2F');
    await page.getByRole('textbox', { name: 'Username' }).fill('tiuadmin');
    await page.getByRole('textbox', { name: 'Password' }).fill('Tiu@12345');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');

    await use(page); // Run the test

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedTitle = testInfo.title.replace(/\s+/g, '_');

    // Only on failure: save trace and screenshot
    if (tracingStarted) {
      try {
        if (testInfo.status !== testInfo.expectedStatus) {
          // Save trace
          const traceDir = path.join('traces');
          fs.mkdirSync(traceDir, { recursive: true });
          const tracePath = path.join(traceDir, `trace-${sanitizedTitle}-${timestamp}.zip`);
          await context.tracing.stop({ path: tracePath });
          console.log(`🧪 Trace saved: ${tracePath}`);

          // Attach trace to Allure
          testInfo.attachments.push({
            name: 'trace',
            path: tracePath,
            contentType: 'application/zip',
          });

          // Save screenshot
          const screenshotDir = path.join('screenshots');
          fs.mkdirSync(screenshotDir, { recursive: true });
          const screenshotPath = path.join(screenshotDir, `failure-${sanitizedTitle}-${timestamp}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });

          // Attach screenshot to Allure
          testInfo.attachments.push({
            name: 'screenshot',
            path: screenshotPath,
            contentType: 'image/png',
          });

        } else {
          // Test passed, stop tracing without saving
          await context.tracing.stop();
        }
      } catch (err) {
        console.warn('⚠️ Failed to stop tracing or capture evidence:', err.message);
      }
    }

    await context.close();
  },
});

export { expect };