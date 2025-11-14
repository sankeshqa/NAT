const { test, expect } = require('./fixtures/loggedInFixture');


test('Add Record manually', async ({ page }, testInfo) => {
  // ✅ Allure Metadata
  testInfo.annotations.push({ type: 'feature', description: 'Manual Record Entry' });
  testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
  testInfo.annotations.push({ type: 'severity', description: 'critical' });

  // ✅ Collect Console Logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  await test.step('Navigate to Add Record page', async () => {
    await page.getByRole('button', { name: ' Records 󰅂' }).click();
    await page.getByRole('link', { name: 'Add Record' }).click();
  });

  await test.step('Select company by visible text', async () => {
    await page.locator('#company-id').selectOption({ label: 'TEST_Partner' });
  });

  await test.step('Fill address details', async () => {
    //await page.goto('https://nat.tiuconsulting.us/files-vendor-assignment/add-records');
    await expect(page.locator('#streetnumber')).toBeVisible({ timeout: 10000 });
    await page.locator('#streetnumber').fill('118 W strretboro');
    await page.locator('#streetname').fill('St john street');
    await page.locator('#city').fill('Hudson');
    await page.locator('#zip').fill('44744');
    await page.locator('#state').selectOption('FL');
    await expect(page.locator('select[name="County"]')).toBeVisible({ timeout: 15000 });
    await page.locator('select[name="County"]').selectOption('Columbia');
  });

  await test.step('Fill grantor and grantee information', async () => {
    await page.locator('#grantors').fill('sankesh');
    await page.locator('#grantorfirstname1').fill('sam');
    await page.locator('#grantorfirstname2').fill('sameer');
    await page.locator('#grantormaritalstatus').fill('married');
    await page.locator('#grantorcorporationname').fill('Tiu Consulting');
    await page.locator('#grantees').fill('smit');
    await page.locator('#granteefirstname1').fill('sank');
    await page.locator('#granteefirstname2').fill('somkuwar');
  });

  await test.step('Fill record details and select vendor', async () => {
    await page.locator('#partnerfilenumber').fill('69882200');
    await page.locator('#centerbranch').fill('Nagpur');
    await page.locator('#loanamount').fill('340000');
    await page.locator('#transactiontype').selectOption('2');
    await page.locator('#apnparcelnumber').fill('67735555567899');
    await page.locator('#vendorid').selectOption({ label: 'Test_Vendor' });
    await page.locator('#serv div').filter({ hasText: 'Full Search' }).locator('#search_criteria').check();
  });

  await test.step('Submit the record', async () => {
    await page.getByRole('button', { name: 'Save' }).nth(2).click();
    await page.waitForTimeout(5000);
  });

  // ✅ Attach console logs to testInfo
  testInfo.attachments = testInfo.attachments || [];
  testInfo.attachments.push({
    name: 'console logs',
    contentType: 'text/plain',
    body: Buffer.from(consoleLogs.join('\n'), 'utf-8'),
  });
});

// ✅ Attach screenshot and logs on failure
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
