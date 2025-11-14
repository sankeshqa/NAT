const { test, expect } = require('./fixtures/loggedInFixture');

test('Import Sheet Setting Mapping', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'feature', description: 'Import Sheet Setting Mapping' });
    testInfo.annotations.push({ type: 'owner', description: 'Sankesh' });
    testInfo.annotations.push({ type: 'severity', description: 'critical' });

    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await test.step('Navigate to Import Sheet Setting', async () => {
        await page.getByRole('button', { name: ' Partners 󰅂' }).click();
        await page.getByRole('link', { name: 'Import Sheet Setting' }).click();
        await page.getByRole('combobox').selectOption({ label: 'TEST_Partner' });
        await page.waitForSelector('table');
        
    });

    const fieldsToCheck = [
        'NATFileNumber',
        'PartnerFileNumber',
        'TagNumber',
        'PartnerID',
        'FileStartDate',
        'TransactionType',
        'PurchasePriceConsideration',
        'LoanAmount',
        'LoanNumber',
        'StreetNumber',
        'StreetName',
        'City',
        'State',
        'County',
        'Zip',
        'APNParcelNumber',
        'Grantors',
        'GrantorFirstName1',
        'GrantorLastName1',
        'Grantees',
        'GranteeFirstName1',
        'GranteeLastName1',
        'MortgagorGrantors',
        'MortgagorGrantorFirstName1',
        'MortgagorGrantorLastName1',
        'MortgageeLenderCompanyName',
        'MortgageeFirstName1',
        'MortgageeLastName1',
        'SSN'
    ];

    await test.step('Check all required fields', async () => {
        for (const label of fieldsToCheck) {
            try {
                const rows = page.locator('tr', { hasText: label });
                const rowCount = await rows.count();

                if (rowCount === 0) {
                    console.warn(`⚠️ Could not find row for: ${label}`);
                    continue;
                }

                let found = false;
                for (let i = 0; i < rowCount; i++) {
                    const row = rows.nth(i);
                    const checkbox = row.getByRole('checkbox');
                    if (await checkbox.count()) {
                        await checkbox.scrollIntoViewIfNeeded();
                        await checkbox.check({ force: true });
                        console.log(`✅ Checked: ${label}`);
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    console.warn(`⚠️ Checkbox not found in matching rows for: ${label}`);
                }
            } catch (e) {
                console.error(`❌ Error checking checkbox for: ${label} → ${e.message}`);
            }
        }
    });

    await test.step('Submit the form', async () => {
        const submitButton = page.getByRole('button', { name: 'Submit' }).first();
        await expect(submitButton).toBeEnabled();

        await Promise.all([
           // page.waitForResponse(resp => resp.url().includes('/The Partner Import Sheet Setting has been saved.') && resp.status() === 200),
            submitButton.click({ force: true }),
        ]);

        // Optionally validate success toast
        await expect(page.getByText('The Partner Import Sheet Setting has been saved')).toBeVisible({ timeout: 5000 });
    });

    testInfo.attachments = testInfo.attachments || [];
    testInfo.attachments.push({
        name: 'console logs',
        contentType: 'text/plain',
        body: Buffer.from(consoleLogs.join('\n')),
    });
});

test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach('screenshot', {
            body: await page.screenshot(),
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