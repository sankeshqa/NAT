const { test, expect } = require('./fixtures/loggedInFixture');

test('Submit Approved AOL to Client Flow', async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: 'feature', description: 'Submit Approved AOL Flow' });
  testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
  testInfo.annotations.push({ type: 'severity', description: 'critical' });

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

  await test.step('Navigate to Create AOL Template', async () => {
    await page.getByRole('button', { name: ' AOL 󰅂' }).click();
    await page.getByRole('link', { name: 'Create AOL Template' }).click();
    await page.locator('input[type="radio"][name="DocumentReceived"][value="pre_aol_status"]').check();
    //await page.locator('#documentreceived-pre_aol_status').check();
  });

  await test.step('Go to AOL Index and select record', async () => {
    //await page.goto('https://nat.tiuconsulting.us/files-vendor-assignment/aolindex');
    const checkbox = page.locator('input[name="checkAll[]"]').nth(1); // 0-based index
    await checkbox.waitFor({ state: 'attached', timeout: 10000 });
    await checkbox.check();
  });

  await test.step('Submit Approved AOL to Client', async () => {
    //await page.getByRole('button', { name: 'Submit Approved AOL to Client' }).click();
  });

  await test.step('Download Signed AOL PDF', async () => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download Signed AOL PDF' }).nth(1).click();
    const download = await downloadPromise;
    const path = await download.path();
    console.log(`✅ PDF downloaded to: ${path}`);
  });

  await test.step('Send Approved AOL Email to Client', async () => {
    await page.getByRole('link', { name: '' }).nth(1).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill('sankeshqa@tiuconsulting.com');
    await page.getByRole('textbox', { name: 'Subject' }).fill('Attorney Approved AOL ');
    await page.getByRole('textbox', { name: 'Message' }).fill('Please review the Attorney signed AOL \nThanks ');
    await page.getByRole('button', { name: 'Send Email' }).click();
    await page.waitForTimeout(5000);
  });

  testInfo.attachments = testInfo.attachments || [];
  testInfo.attachments.push({
    name: 'console logs',
    contentType: 'text/plain',
    body: Buffer.from(logs.join('\n')),
  });
});

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