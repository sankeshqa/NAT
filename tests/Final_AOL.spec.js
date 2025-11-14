const { test, expect } = require('./fixtures/loggedInFixture');

test('Generate and Email Final AOL PDF', async ({ page }, testInfo) => {
  // ✅ Allure metadata
  testInfo.annotations.push({ type: 'feature', description: 'Generate and Email Final AOL' });
  testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
  testInfo.annotations.push({ type: 'severity', description: 'critical' });

  // ✅ Console logs
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

  // ✅ Step 1: Navigate to Create AOL Template
  await test.step('Open Create AOL Template', async () => {
    await page.getByRole('button', { name: ' AOL 󰅂' }).click();
    await page.getByRole('link', { name: 'Create AOL Template' }).click();
    await page.locator('#company-id').selectOption({ label: 'TEST_Partner' });
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForTimeout(5000);
    await page.locator('input[type="radio"][name="DocumentReceived"][value="pre_aol_status"]').click();
    await page.waitForTimeout(5000);
  });

  // ✅ Step 2: Go to AOL Index and select record
  await test.step('Select record and generate Final AOL', async () => {
    //await page.goto('https://nat.tiuconsulting.us/files-vendor-assignment/aolindex');
    const checkbox = page.locator('input[name="checkAll[]"]').nth(1); // 0-based index
    await checkbox.waitFor({ state: 'attached', timeout: 10000 });
    await checkbox.check();
    await page.getByRole('button', { name: 'Create Final AOL for Attorney' }).click();
    await page.waitForTimeout(5000);
    await page.locator('input[type="radio"][name="DocumentReceived"][value="final_aol_status"]').click();
    await page.waitForTimeout(5000);
  });

  // ✅ Step 3: Download Final AOL PDF
  await test.step('Download Final AOL PDF', async () => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download Final AOL PDF' }).nth(1).click();
    const download = await downloadPromise;
    const filePath = await download.path();
    console.log(`✅ Downloaded Final AOL PDF at: ${filePath}`);
  });

  // ✅ Step 4: Send Final AOL Email
  await test.step('Send Final AOL Email', async () => {
    await page.getByRole('link', { name: 'Final AOL Email' }).nth(1).click();
    await page.getByRole('textbox', { name: 'Subject' }).fill('Final AOL Review');
    await page.getByRole('textbox', { name: 'Message' }).fill('Please review the Final AOL \nThanks');
    await page.getByRole('button', { name: 'Send Email' }).click();
    await page.waitForTimeout(5000);
  });

  // ✅ Attach console logs to report
  testInfo.attachments = testInfo.attachments || [];
  testInfo.attachments.push({
    name: 'console logs',
    contentType: 'text/plain',
    body: Buffer.from(consoleLogs.join('\n')),
  });
});

// ✅ Attach screenshot on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await testInfo.attach('screenshot', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });

    if (!testInfo.attachments.find(a => a.name === 'console logs')) {
      await testInfo.attach('console logs', {
        body: Buffer.from('No console logs collected'),
        contentType: 'text/plain',
      });
    }
  }
});