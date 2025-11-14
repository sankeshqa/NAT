const { test, expect } = require('./fixtures/loggedInFixture');
const path = require('path');

test('Upload Receipt of Exam CSV', async ({ page }, testInfo) => {
  // ✅ Allure metadata
  testInfo.annotations.push({ type: 'feature', description: 'Upload Receipt of Exam CSV' });
  testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
  testInfo.annotations.push({ type: 'severity', description: 'critical' });

  // ✅ Collect console logs
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

  // ✅ Step 1: Navigate to upload screen
  await test.step('Navigate to Upload Receipt of Exam CSV screen', async () => {
    await page.getByRole('button', { name: 'Receipt of Exam' }).click();
    await page.getByRole('link', { name: 'Upload Receipt of Exam CSV' }).click();
  });

  // ✅ Step 2: Select company
  await test.step('Select company', async () => {
    await page.locator('#companyid').selectOption({ label: 'TEST_Partner' });
    await page.waitForTimeout(3000); // small wait for stability
  });

  // ✅ Step 3: Upload CSV
  const shouldUpload = false; // ✅ Toggle this flag
    const filePath = 'C:\\Users\\Tiu User\\Desktop\\NAT_UPLOAD_CSV\\Recipt_OF_EX_MOD.csv';
    await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);

    // ✅ Step 3: Upload CSV if flag is true
    if (shouldUpload) {
        await test.step('Upload CSV file', async () => {
            await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);

        });
    }

  // ✅ Step 4: Click Import and validate
  await test.step('Click Import and validate result', async () => {
    await page.getByRole('button', { name: 'Import CSV' }).click();

    try {
      const successMsg = page.locator('.alert-success');
      await expect(successMsg).toBeVisible({ timeout: 8000 });
      const msgText = await successMsg.innerText();
      console.log(`✅ Import Success: ${msgText}`);
    } catch {
      const errorLocator = page.locator('.alert-danger');
      if (await errorLocator.isVisible()) {
        const errorMessage = await errorLocator.innerText();
        await testInfo.attach('CSV Upload Error Message', {
          body: Buffer.from(errorMessage, 'utf-8'),
          contentType: 'text/plain',
        });
        console.log(`❌ Import Error: ${errorMessage}`);
      } else {
        throw new Error('CSV upload failed and no error message found.');
      }
    }
  });

  // ✅ Attach console logs
  testInfo.attachments = testInfo.attachments || [];
  testInfo.attachments.push({
    name: 'console logs',
    contentType: 'text/plain',
    body: Buffer.from(consoleLogs.join('\n')),
  });
});

// ✅ Failure screenshot
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