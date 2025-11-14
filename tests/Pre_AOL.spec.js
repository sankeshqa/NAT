const { test, expect } = require('./fixtures/loggedInFixture');

test('Create and Email Preliminary AOL Template', async ({ page }, testInfo) => {
  // ✅ Allure metadata
  testInfo.annotations.push({ type: 'feature', description: 'AOL Template Creation and Email' });
  testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
  testInfo.annotations.push({ type: 'severity', description: 'critical' });

  // ✅ Console log capture
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

  // ✅ Step 1: Navigate to Create AOL Template screen
  await test.step('Navigate to Create AOL Template', async () => {
    await page.getByRole('button', { name: ' AOL 󰅂' }).click();
    await page.getByRole('link', { name: 'Create AOL Template' }).click();
  });

  // ✅ Step 2: Select company and search
  await test.step('Select company and search records', async () => {
    await page.locator('#company-id').selectOption({ label: 'TEST_Partner' });
    await page.getByRole('button', { name: 'Search', exact: true }).click();
  });

  // ✅ Step 3: Select record and create Preliminary AOL
  await test.step('Create Preliminary AOL', async () => {
    const checkbox = page.locator('input[name="checkAll[]"]').nth(1); // 0-based index
    await checkbox.waitFor({ state: 'attached', timeout: 10000 });
    await checkbox.check();
    
  });

  // ✅ Step 4: Download Preliminary AOL PDF
  await test.step('Download Preliminary AOL PDF', async () => {
    await page.getByRole('button', { name: 'Create Preliminary AOL' }).click();
    await page.locator('input[type="radio"][name="DocumentReceived"][value="pre_aol_status"]').click();
    //await page.locator('#documentreceived-pre_aol_status').check();
    //await page.goto('https://nat.tiuconsulting.us/files-vendor-assignment/aolindex');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download Preliminary AOL PDF' }).nth(1).click();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    console.log(`✅ PDF downloaded to: ${downloadPath}`);
  });

  // ✅ Step 5: Send AOL Email
  await test.step('Compose and send AOL email', async () => {
    await page.getByRole('link', { name: 'Preliminary AOL Email' }).nth(1).click();
    await page.getByRole('textbox', { name: 'Subject' }).fill('Pre_AOL ');
    await page.getByRole('textbox', { name: 'Message' }).fill('Please review the created Pre-AOL \nThanks');
    await page.getByRole('button', { name: 'Send Email' }).click();
    await page.waitForTimeout(5000);
  });

  // ✅ Attach console logs
  testInfo.attachments = testInfo.attachments || [];
  testInfo.attachments.push({
    name: 'console logs',
    contentType: 'text/plain',
    body: Buffer.from(consoleLogs.join('\n')),
  });
});

// ✅ Handle screenshot on failure
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