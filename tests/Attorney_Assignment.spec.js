const { test, expect } = require('./fixtures/loggedInFixture');

test('Attorney Assignment - Assign multiple records to attorney', async ({ page }, testInfo) => {
    // ✅ Allure Metadata
    testInfo.annotations.push({ type: 'feature', description: 'Attorney Assignment' });
    testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
    testInfo.annotations.push({ type: 'severity', description: 'critical' });

    // ✅ Console Log Capture
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // ✅ Step 1: Navigate to Attorney Assignment
    await test.step('Navigate to Attorney Assignment', async () => {
        await page.getByRole('button', { name: ' AOL 󰅂' }).click();
        await page.getByRole('link', { name: 'Attorney Assignment' }).click();
    });

    // ✅ Step 2: Select company by name
    await test.step('Select company by visible text', async () => {
        await page.locator('#company-id').selectOption({ label: 'TEST_Partner' });
        await page.locator('#documentreceived-all').check();
        await page.waitForTimeout(1000); // Wait for data load
    });

    // ✅ Step 3: Search for records
    await test.step('Click Search', async () => {
        await page.getByRole('button', { name: 'Search', exact: true }).click();
        await page.waitForLoadState('networkidle');
    });

    // ✅ Step 4: Select checkboxes for records by index
    await test.step('Select checkboxes for the first 5 records', async () => {
        const checkboxes = await page.locator('table tbody tr input[type="checkbox"]');

        const total = await checkboxes.count();
        const selectCount = Math.min(3, total); // Adjust if fewer than 5 rows available

        for (let i = 0; i < selectCount; i++) {
            await checkboxes.nth(i).check();
        }
    });
    // ✅ Step 5: Assign Attorney
    await test.step('Assign Attorney to selected records', async () => {
        await page.getByRole('button', { name: 'Assign Attorney' }).click();
        await page.locator('#vendorid').selectOption({ label: 'Test_Vendor' });
        await page.locator('#search_criteria_5').check();
        await page.locator('#delivery_type_email').first().check();
        await page.getByRole('button', { name: 'Submit' }).click();
    });

    // ✅ Attach console logs
    testInfo.attachments = testInfo.attachments || [];
    testInfo.attachments.push({
        name: 'console logs',
        contentType: 'text/plain',
        body: Buffer.from(consoleLogs.join('\n')),
    });
});

// ✅ Attach screenshot + console logs on failure
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