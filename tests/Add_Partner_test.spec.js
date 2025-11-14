const { test, expect } = require('./fixtures/loggedInFixture');

test('Add Partner', async ({ page }, testInfo) => {
  // Attach metadata to Allure
  testInfo.annotations.push({ type: 'feature', description: 'Partner Management' });
  testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
  testInfo.annotations.push({ type: 'severity', description: 'critical' });

  // Collect console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  await test.step('Go to Add Partner', async () => {
    await page.getByRole('button', { name: ' Partners 󰅂' }).click();
    await page.getByRole('link', { name: 'List Partners' }).click();
    await page.getByRole('link', { name: 'Add Partner' }).click();
  });

  await test.step('Fill form', async () => {
    await page.getByRole('textbox', { name: 'Only letters and special' }).fill('TEST_Partner');
    await page.getByRole('textbox', { name: 'Only letters, numbers and' }).fill('TIU Consulting');
    await page.getByRole('textbox', { name: 'Only numbers and special' }).fill('8446760010');
    await page.getByRole('textbox', { name: 'Only letters and numbers are' }).fill('Tiuqa1234@yopmail.com');
  });

  await test.step('Submit and verify', async () => {
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(5000);
    
  });

  // Save logs to testInfo
  testInfo.consoleLogs = consoleLogs;
});

// Attach screenshot + console logs on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    // Screenshot
    await testInfo.attach('screenshot', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });

    // Console logs
    if (testInfo.consoleLogs && testInfo.consoleLogs.length > 0) {
      await testInfo.attach('console logs', {
        body: Buffer.from(testInfo.consoleLogs.join('\n'), 'utf-8'),
        contentType: 'text/plain',
      });
    }
  }
});