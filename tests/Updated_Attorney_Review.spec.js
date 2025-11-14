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
        await page.getByRole('textbox', { name: 'Login' }).fill('TestAOL12345678');
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

        await docuSignPage.waitForURL(/docusign\.net\/Signing/, { timeout: 20000 });
    });

    // DocuSign signature step
    await test.step('Sign all "Sign Here" fields sequentially', async () => {
        try {
            const consentCheckbox = docuSignPage.locator('span', {
                hasText: 'I agree to use electronic',
            });

            const isConsentVisible = await consentCheckbox.first().isVisible({ timeout: 3000 }).catch(() => false);

            if (isConsentVisible) {
                console.log('⚠️ Electronic consent alert detected — handling it...');

                // Step 1: Accept checkbox
                await consentCheckbox.first().click();

                // Step 2: Click Continue
                await docuSignPage.getByRole('button', { name: 'Continue' }).click();
            }

            // Step 3: Click first "Sign Here"
            const firstSign = docuSignPage.getByRole('button', { name: 'Sign Here' }).first();
            await firstSign.scrollIntoViewIfNeeded();
            await firstSign.click();
            console.log('✅ Clicked first Sign Here');
            await docuSignPage.waitForTimeout(2000);

            // Step 4: Handle Adopt and Sign if visible
            const adoptBtn = docuSignPage.getByRole('button', { name: 'Adopt and Sign' });
            if (await adoptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await adoptBtn.click();
                console.log('✅ Clicked Adopt and Sign');
                await docuSignPage.waitForTimeout(2000);
            }

            // Step 5: Continue clicking all remaining "Sign Here" buttons
            let count = 2;
            while (true) {
                const signBtn = docuSignPage.getByRole('button', { name: 'Sign Here' }).first();
                const visible = await signBtn.isVisible({ timeout: 5000 }).catch(() => false);
                if (!visible) break;

                await signBtn.scrollIntoViewIfNeeded();
                await signBtn.click();
                console.log(`✅ Clicked Sign Here button #${count++}`);
                await docuSignPage.waitForTimeout(1000);
            }

            // Step 6: Click Finish
            await docuSignPage.locator('#end-of-document-btn-finish').click({ timeout: 10000 });
            console.log('✅ Clicked Finish');

        } catch (e) {
            console.warn('❌ Error during signature step:', e.message);
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