const { test, expect } = require('./fixtures/loggedInFixture');

test('Add Vendor Form Automation', async ({ page }, testInfo) => {
  // ✅ Allure metadata
  testInfo.annotations.push({ type: 'feature', description: 'Vendor Management' });
  testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
  testInfo.annotations.push({ type: 'severity', description: 'critical' });

  // ✅ Collect console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // ✅ Step 1: Navigate to Add Vendor
  await test.step('Navigate to Add Vendor page', async () => {
    await page.getByRole('button', { name: ' Vendor Management 󰅂' }).click();
    await page.getByRole('link', { name: 'Add Vendor', exact: true }).click();
  });

  // ✅ Step 2: Fill basic vendor info
  await test.step('Fill Vendor Information', async () => {
    await page.getByRole('textbox', { name: 'Vendor Name *' }).fill('Test_Vendor');
    await page.getByRole('textbox', { name: 'Address *' }).fill('118 W Streetboro');
    await page.getByRole('textbox', { name: 'City *' }).fill('Hudson');
    await page.getByRole('textbox', { name: 'State *' }).fill('Ohio');
    await page.getByRole('textbox', { name: 'Zip *' }).fill('44744');
  });

  // ✅ Step 3: Fill contact details
  await test.step('Fill Main & Accounting Contact Info', async () => {
    await page.locator('#main-contact-name').fill('SankeshQA');
    await page.locator('#main-contact-phone').fill('9881419694');
    await page.locator('#main-contact-email').fill('PlaywrightQATest@yopmail.com');

    await page.locator('#accounting-contact-name').fill('Test_Account');
    await page.locator('#accounting-contact-phone').fill('8625038664');
    await page.locator('#accounting-contact-email').fill('TestAccountQA@yopmail.com');

    await page.locator('#accounting-contact-email').press('ArrowDown');
    await page.locator('#accounting-contact-email').press('ArrowDown');
    await page.locator('#accounting-contact-email').press('ArrowDown');
  });

  // ✅ Step 4: Service options and states
  await test.step('Select services, states, and status', async () => {
    await page.getByRole('textbox', { name: 'States (Comma Separated)' }).fill('All');
    await page.getByRole('checkbox', { name: 'Full Search - 72 Hours' }).check();
    await page.getByRole('checkbox', { name: 'Two Owner (24 Month Chain) -' }).check();
    await page.getByRole('checkbox', { name: 'Current Owner - 24 Hours' }).check();
    await page.getByRole('checkbox', { name: 'Attorney Opinion Letter' }).check();
    await page.getByRole('checkbox', { name: 'Escrow and Closing - NA' }).check();

    await page.getByLabel('List All States and Counties').selectOption('List All States and Counties');
    await page.getByLabel('Vendor Status').selectOption('Active');
    await page.getByLabel('Priority/Grade Status').selectOption('A = Primary');
  });

  // ✅ Step 5: Submit form
  await test.step('Submit the Vendor Form', async () => {
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(5000);
  });

  // ✅ Attach logs
  testInfo.attachments = testInfo.attachments || [];
  testInfo.attachments.push({
    name: 'console logs',
    contentType: 'text/plain',
    body: Buffer.from(consoleLogs.join('\n')),
  });
});

// ✅ Screenshot + log on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await testInfo.attach('screenshot', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });

    if (!testInfo.attachments.find(a => a.name === 'console logs')) {
      await testInfo.attach('console logs', {
        body: Buffer.from('No console logs found'),
        contentType: 'text/plain',
      });
    }
  }
});