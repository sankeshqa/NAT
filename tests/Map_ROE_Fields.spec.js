const { test, expect } = require('./fixtures/loggedInFixture');

test('Map Receipt of Exam Fields', async ({ page }, testInfo) => {
  // ✅ Allure Metadata
  testInfo.annotations.push({ type: 'feature', description: 'Map Receipt of Exam Fields' });
  testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
  testInfo.annotations.push({ type: 'severity', description: 'critical' });

  // ✅ Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // ✅ Step 1: Navigate to Receipt of Exam Mapping
  await test.step('Navigate to Map Receipt of Exam Fields screen', async () => {
    await page.getByRole('button', { name: 'Receipt of Exam' }).click();
    await page.getByRole('link', { name: 'Map Receipt of Exam Fields' }).click();
  });

  // ✅ Step 2: Select company by label
  await test.step('Select company from dropdown', async () => {
    await page.getByRole('combobox').selectOption({ label: 'TEST_Partner' });
    await page.waitForTimeout(5000); // wait after selection if needed
  });

  // ✅ Step 3: Go to mapping page
  //await test.step('Navigate to mapping page URL', async () => {
    //await page.goto('https://nat.tiuconsulting.us/fields-mst-exam/map-company-field');
  //});

  // ✅ Step 4: Fill all mapping fields
  const fieldMappings = {
    PartnerFileNumber: 'TagNumber',
    OfficialPropertyAddress: 'PropertyAddress',
    VestingDeedType: 'DeedType',
    VestingConsiderationAmount: 'Amount',
    VestedAsGrantee: 'Grantee',
    VestingGrantor: 'Grantor',
    VestingDated: 'Date',
  };

  await test.step('Fill mapping fields', async () => {
    for (const [field, value] of Object.entries(fieldMappings)) {
      const row = page.getByRole('row', { name: field });
      const input = row.locator('#cfm-maptitle');
      await input.click();
      await input.fill(value);
    }
  });

  // ✅ Step 5: Submit the mapping
  await test.step('Click Submit', async () => {
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: 'Submit' }).first().click();
  });

  const successMsg = page.locator('.alert-success'); // adjust selector if needed
  await expect(successMsg).toBeVisible({ timeout: 10000 });
  const messageText = await successMsg.innerText();

  // Log or attach to test report
  console.log(`✅ Success Message: ${messageText}`);

  // ✅ Attach console logs
  testInfo.attachments = testInfo.attachments || [];
  testInfo.attachments.push({
    name: 'console logs',
    contentType: 'text/plain',
    body: Buffer.from(consoleLogs.join('\n')),
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