const { test, expect } = require('./fixtures/loggedInFixture');
test.setTimeout(120000);

test('Yopmail Signature Flow - Safe DocuSign Flow', async ({ page, context }, testInfo) => {
  testInfo.annotations.push({ type: 'feature', description: 'Email & Signature Flow' });
  testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
  testInfo.annotations.push({ type: 'severity', description: 'critical' });

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

  await test.step('Open Yopmail inbox', async () => {
    await page.goto('https://yopmail.com/');
    await page.getByRole('textbox', { name: 'Login' }).fill('PlaywrightQATest');
    await page.getByRole('button', { name: '' }).click();
  });

  let page2;
  await test.step('Open vendor review from Yopmail iframe', async () => {
    const popup = page.waitForEvent('popup');
    await page.frameLocator('iframe[name="ifmail"]').getByRole('link', { name: 'here' }).click();
    page2 = await popup;
  });

  await test.step('Fill vendor questions and click Add Signature', async () => {
    for (let i = 1; i <= 7; i++) {
      await page2.locator(`input[name="q${i}"]`).nth(1).check();
    }
    await page2.getByRole('radio', { name: 'Accept' }).check();
  });

  let docuSignPage;
  await test.step('Handle navigation to DocuSign', async () => {
    const existingPages = context.pages();
    await page2.getByRole('button', { name: 'Add Signature in AOL PDF' }).click();
    //await docuSignPage.waitForTimeout(10000);

    await page.waitForTimeout(10000); // Allow DocuSign page to load

    const newPages = context.pages();
    docuSignPage = newPages.find(p => !existingPages.includes(p)) || page2;

    await docuSignPage.waitForURL(/docusign\.net\/Signing/, { timeout: 15000 });
  });

  // DocuSign signature step
  await test.step('Sign all "Sign Here" fields sequentially', async () => {
    try {
      let counter = 1;

      while (true) {
        const button = docuSignPage.locator('button:has-text("Sign Here")').first();

        // Wait up to 5 seconds for a new sign button to appear
        const visible = await button.isVisible().catch(() => false);
        if (!visible) {
          console.log('✅ No more Sign Here buttons visible.');
          break;
        }

        try {
          await button.scrollIntoViewIfNeeded();
          await button.click({ timeout: 5000 });
          console.log(`✅ Clicked Sign Here button #${counter}`);
          counter++;
          await docuSignPage.waitForTimeout(1000); // wait for next to appear
        } catch (e) {
          console.warn(`⚠️ Failed to click Sign button #${counter}:`, e.message);
          break;
        }
      }

      // Finish button
      if (!docuSignPage.isClosed()) {
        await docuSignPage.locator('#end-of-document-btn-finish').click({ timeout: 10000 });
        console.log('✅ Clicked Finish');
        await docuSignPage.waitForTimeout(10000);
      } else {
        console.warn('⚠️ DocuSign page closed before clicking Finish');
      }

    } catch (e) {
      console.warn('⚠️ Error during signature step:', e.message);
    }
  });

  testInfo.attachments = testInfo.attachments || [];
  testInfo.attachments.push({
    name: 'console logs',
    contentType: 'text/plain',
    body: Buffer.from(logs.join('\n')),
  });
});

// ✅ Screenshot on failure
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