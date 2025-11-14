const { test, expect } = require('./fixtures/loggedInFixture');

test('Map Partners Fields', async ({ page }, testInfo) => {
    // Allure metadata
    testInfo.annotations.push({ type: 'feature', description: 'Partner Field Mapping' });
    testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
    testInfo.annotations.push({ type: 'severity', description: 'critical' });

    // Collect console logs
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    try {
        await test.step('Navigate to Map Partners Fields', async () => {
            await page.getByRole('button', { name: ' Partners 󰅂' }).click();
            await page.getByRole('link', { name: 'Map Partners Fields' }).click();
            await page.locator('select[name="cfm_companyid"]').selectOption({ label: 'TEST_Partner' });
            //await page.goto('https://nat.tiuconsulting.us/fields-mst/map-company-field');
        });

        await test.step('Map Field Titles', async () => {
            const mappings = [
                ['PartnerFileNumber', 'TagNumber'],
                ['PartnerID', 'ID'],
                ['FileStartDate', 'StartDate'],
                ['TransactionType', 'Transaction'],
                ['PurchasePriceConsideration', 'Price'],
                ['LoanAmount', 'LoanAmt'],
                ['LoanNumber', 'LoanNumber'],
                ['County', 'jurisdiction'],
                ['Zip', 'Pin'],
                ['A Select Fields Section', 'SSN']
            ];

            for (const [field, value] of mappings) {
                let rowLocator;

                if (field === 'County') {
                    // Use exact match to avoid CountyRecordingFee rows
                    rowLocator = page.getByRole('row', { name: field, exact: true });
                } else {
                    rowLocator = page.getByRole('row', { name: field });
                }

                const input = rowLocator.locator('#cfm-maptitle');
                await input.first().click();
                await input.first().fill(value);
                
            }
        });

        await test.step('Submit the mapped fields', async () => {
            await page.getByRole('button', { name: 'Submit' }).first().click();
            // Optional assertion if there's a success message
            // await expect(page.locator('text=Mapping updated successfully')).toBeVisible();
        });

    } catch (error) {
        // Screenshot on failure
        await testInfo.attach('screenshot', {
            body: await page.screenshot(),
            contentType: 'image/png'
            
        });

        // Console logs on failure
        if (consoleLogs.length > 0) {
            await testInfo.attach('console logs', {
                body: Buffer.from(consoleLogs.join('\n'), 'utf-8'),
                contentType: 'text/plain'
            });
        }

        throw error; // rethrow to fail the test
    }
});