import { test, expect } from '@playwright/test';
import path from 'path';

test('Team Pano Design Order Placement', async ({ page }) => {
  test.setTimeout(300000); // extend timeout for slow UI

  // Step 1: Login
  await page.goto('https://production.nextgenphotosolutions.com/login');
  await page.locator('input[name="data[User][username]"]').fill('rakhiqa@tiuconsulting.com');
  await page.locator('input[name="data[User][password]"]').fill('123456');
  await page.getByRole('button', { name: 'Login »' }).click();

  // Step 2: Continue to A La Carte
  await page.getByText('The A La Carte system is').click();
  await page.getByRole('button', { name: 'Continue »' }).click();

  // Step 3: Start Team Pano Design Job
  await expect(page.getByRole('button', { name: 'Team Pano Design »' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'Team Pano Design »' }).click();

  // Job name input
  const jobNameInput = page.locator('input[name="jobname"], input[placeholder*="Job Name"]');
  await expect(jobNameInput).toBeVisible({ timeout: 10000 });
  await jobNameInput.fill('Team Pano Design 001');

  // Save
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(1000);

  // Step 4: Team creation section
  await page.waitForSelector('#createteamsec', { state: 'visible', timeout: 15000 });
  const teamCountInput = page.locator('input[name="teamcount"]');
  await teamCountInput.fill('2');
  await page.getByRole('button', { name: /submit/i }).click();

  // Step 5: Verify team inputs
  const teamInputs = page.locator('input[name="teamname[]"]');
  await expect(teamInputs).toHaveCount(2);
  await teamInputs.nth(0).fill('ABC');
  await teamInputs.nth(1).fill('XYZ');

  // Step 6: File uploads
  const dropzones = page.locator('input[type="file"]');
  await expect(dropzones).toHaveCount(2, { timeout: 20000 });

  const filePath = path.join('C:', 'Users', 'Tiu User', 'Desktop', 'Uploads document', 'A.jpg');
  const filePath2 = path.join('C:', 'Users', 'Tiu User', 'Uploads document', 'C.jpg');

  console.log("🔹 Uploading to Team 1 dropzone...");
  const team1Dropzone = dropzones.nth(0);
  await team1Dropzone.setInputFiles(filePath);

  console.log("🔹 Uploading to Team 2 dropzone...");
  const team2Dropzone = dropzones.nth(1);
  await team2Dropzone.setInputFiles(filePath2);

  // Step 7: Inject face-api.js (optional, if models hosted)
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/face-api.js' });
  const faceCount = await page.evaluate(async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    const img = document.querySelector('img.preview');
    if (!img) return 0;
    const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());
    return detections.length;
  });
  console.log(`✅ Faces detected: ${faceCount}`);

  // Step 8: Proceed
  try {
    const proceedBtn = page.getByText('Proceed', { exact: false });
    await expect(proceedBtn).toBeVisible({ timeout: 10000 });
    await proceedBtn.click();
    console.log("✅ Proceed clicked successfully.");
  } catch (e) {
    await page.screenshot({ path: 'proceed-error.png', fullPage: true });
    throw e;
  }
});