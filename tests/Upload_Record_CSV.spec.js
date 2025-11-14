const { test, expect } = require('./fixtures/loggedInFixture');
const path = require('path');

test('Upload CSV Record File', async ({ page }, testInfo) => {
    // ✅ Allure Metadata
    testInfo.annotations.push({ type: 'feature', description: 'Record Upload' });
    testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
    testInfo.annotations.push({ type: 'severity', description: 'critical' });

    // ✅ Collect Console Logs
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // ✅ Step 1: Navigate to Upload CSV screen
    await test.step('Navigate to Upload CSV screen', async () => {
        await page.getByRole('button', { name: ' Records 󰅂' }).click();
        await page.getByRole('link', { name: 'Upload CSV' }).click();
    });

    // ✅ Step 2: Select company
    await test.step('Select company from dropdown', async () => {
        await page.locator('#companyid').selectOption({ label: 'TEST_Partner' });
    });

    const shouldUpload = false; // ✅ Toggle this flag
    const filePath = 'C:\\Users\\Tiu User\\Desktop\\NAT_UPLOAD_CSV\\RecordListing_MOD.csv';
    await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);

    // ✅ Step 3: Upload CSV if flag is true
    if (shouldUpload) {
        await test.step('Upload CSV file', async () => {
            await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);

        });
    }

    // ✅ Step 4: Click Import and handle result
    await test.step('Click Import CSV and validate result', async () => {
        await page.getByRole('button', { name: 'Import CSV' }).click();

        const successLocator = page.locator('.alert-success');
        const errorLocator = page.locator('.alert-danger');

        try {
            // Wait for either success or error alert
            await Promise.race([
                successLocator.waitFor({ timeout: 10000 }),
                errorLocator.waitFor({ timeout: 10000 })
            ]);

            if (await successLocator.isVisible()) {
                const successMsg = await successLocator.innerText();
                console.log('✅ Success:', successMsg);
                await testInfo.attach('Upload Success Message', {
                    body: Buffer.from(successMsg, 'utf-8'),
                    contentType: 'text/plain',
                });
            } else if (await errorLocator.isVisible()) {
                const errorMsg = await errorLocator.innerText();
                console.log('❌ Error:', errorMsg);
                await testInfo.attach('Upload Error Message', {
                    body: Buffer.from(errorMsg, 'utf-8'),
                    contentType: 'text/plain',
                });
            } else {
                throw new Error('⚠️ Neither success nor error alert appeared.');
            }
        } catch (err) {
            console.error('❌ Unexpected behavior during alert wait:', err);
            throw err;
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

// ✅ Attach screenshot + logs on failure
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