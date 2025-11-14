const { test, expect } = require('./fixtures/loggedInFixture');

// ✅ Enhanced test with Allure metadata, screenshot on failure, and structured logging
test('Import Receipt of Exam Fields', async ({ page }, testInfo) => {
  // ✅ Allure Metadata
  testInfo.annotations.push({ type: 'feature', description: 'Import Receipt of Exam Fields' });
  testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
  testInfo.annotations.push({ type: 'severity', description: 'critical' });

  // ✅ Console log collection
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

  await test.step('Navigate to Import Receipt of Exam Fields screen', async () => {
    await page.getByRole('button', { name: 'Receipt of Exam' }).click();
    await page.getByRole('link', { name: 'Import Receipt of Exam Fields' }).click();
    await page.getByRole('combobox').selectOption({ label: 'TEST_Partner' });
    await page.waitForTimeout(2000);
    //await page.goto('https://nat.tiuconsulting.us/fields-mst-exam/import-company-field');
  });

  // ✅ Select checkboxes dynamically
  const fieldNames = [
    'OfficialPropertyAddress',
    'VestingDeedType DeedType',
    'VestingConsiderationAmount',
    'VestedAsGrantee Grantee',
    'VestingGrantor Grantor',
    'VestingDated',
    'VestingRecordedDate',
    'VestingBookPage',
    'VestingInstrument',
    'VestingComments',
    'OpenMortgageAmount',
    'OpenMortgageDated',
    'OpenMortgageRecordedDate',
    'OpenMortgageBookPage',
    'OpenMortgageInstrument',
    'OpenMortgageBorrowerMortgagor',
    'OpenMortgageLenderMortgagee',
    'OpenMortgageTrustee1',
    'OpenMortgageTrustee2',
    'OpenMortgageComments',
    'OpenJudgmentsType',
    'OpenJudgmentsLienHolderPlaintiff',
    'OpenJudgmentsBorrowerDefendant',
    'OpenJudgmentsAmount',
    'OpenJudgmentsDateEntered',
    'OpenJudgmentsDateRecorded',
    'OpenJudgmentsBookPage',
    'OpenJudgmentsInstrument',
    'OpenJudgmentsComments',
    'TaxStatus',
    'TaxYear',
    'TaxAmount',
    'TaxType',
    'TaxPaymentSchedule',
    'TaxDueDate',
    'TaxDelinquentDate',
    'TaxComments',
    'TaxLandValue',
    'TaxBuildingValue',
    'TaxTotalValue',
    'TaxAPNAccount',
    'TaxAssessedYear',
    'TaxTotalValue2',
    'TaxMunicipalityCounty',
    'LegalDescription'
  ];

  await test.step('Check all required fields', async () => {
    for (const name of fieldNames) {
    const row = name === 'TaxTotalValue' || name === 'TaxTotalValue2'
      ? page.getByRole('row', { name, exact: true })
      : page.getByRole('row', { name });
    //for (const name of fieldNames) {
      //const row = page.getByRole('row', { name });
      await row.getByRole('checkbox').check();
    }
  });

  await test.step('Submit the import form', async () => {
    await page.getByRole('button', { name: 'Submit' }).nth(1).click();
    await page.waitForTimeout(2000);
    const successMsg = page.locator('.alert-success');
    await expect(successMsg).toBeVisible({ timeout: 10000 });
    const msgText = await successMsg.innerText();
    console.log(`✅ Success: ${msgText}`);
    //await expect(page.locator('text=Fields imported successfully')).toBeVisible({ timeout: 5000 });
  });

  // ✅ Attach console logs
  testInfo.attachments = testInfo.attachments || [];
  testInfo.attachments.push({
    name: 'console logs',
    contentType: 'text/plain',
    body: Buffer.from(consoleLogs.join('\n')),
  });
});

// ✅ Failure handling with screenshot

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await testInfo.attach('screenshot', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png'
    });

    if (!testInfo.attachments.find(a => a.name === 'console logs')) {
      await testInfo.attach('console logs', {
        body: Buffer.from('No console logs collected'),
        contentType: 'text/plain'
      });
    }
  }
});
