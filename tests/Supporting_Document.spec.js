const { test, expect } = require('./fixtures/loggedInFixture');
test.setTimeout(120000);

test('Upload Supporting Document', async ({ page, context }, testInfo) => {
    // 🧩 Allure annotations
    testInfo.annotations.push({ type: 'feature', description: 'Supporting Document Upload' });
    testInfo.annotations.push({ type: 'owner', description: 'Sankesh Somkuwar' });
    testInfo.annotations.push({ type: 'severity', description: 'critical' });

    // 📋 Capture console logs
    const logs = [];
    page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

    // 🪜 Step 1: Go to Upload Supporting Document Page
    await test.step('Navigate to Supporting Document module', async () => {
        //await page.goto('https://nat.tiuconsulting.us/dashboard'); // or your landing URL
        await page.waitForLoadState('networkidle');

        // Navigate via UI menu (adjust locators accordingly)Others
        await page.getByRole('button', { name: 'Others' }).click();
        //await page.getByRole('link', { name: 'Others' }).click();
        await page.getByRole('link', { name: 'Upload Supporting Document' }).click();
        await expect(page).toHaveURL(/upload-supporting-document/);
    });

    const shouldUpload = false; // ✅ Toggle this flag
    const filePath = 'C:\\Users\\Tiu User\\Desktop\\NAT_UPLOAD_CSV\\Test_Upload_01.pdf';
    await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);

    // ✅ Step 3: Upload CSV if flag is true
    if (shouldUpload) {
        await test.step('Upload CSV file', async () => {
            await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);

        });
    }

    // 🪜 Step 5: Submit upload
    await test.step('Submit and validate success message', async () => {
        await page.getByRole('button', { name: 'Upload Document' }).click();

        // Expect success message or toast
        const successToast = page.locator('text=Supporting documents successfully uploaded');
        await expect(successToast).toBeVisible({ timeout: 10000 });
    });

    // 🪜 Step 6: Verify document appears in the uploaded list 50
   // await test.step('Verify uploaded document in the table', async () => {
   //     await page.getByRole('button', { name: 'dataTables-example_length' }).click();
   //     await page.getByRole('link', { name: '50' }).click();
   //     await page.waitForTimeout(4000)
   //     const fileRow = page.locator('table >> text=Test_Upload_01.pdf');
   //     await expect(fileRow).toBeVisible({ timeout: 10000 });
   // });

    // 🧷 Attach console logs to Allure
    testInfo.attachments = testInfo.attachments || [];
    testInfo.attachments.push({
        name: 'console logs',
        contentType: 'text/plain',
        body: Buffer.from(logs.join('\n')),
    });
});

// ✅ Screenshot + log on failure
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
