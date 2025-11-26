import { test, expect } from '@playwright/test';

test.describe('Screenshots', () => {
  test('generate product showcase screenshots', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    page.on('pageerror', exception => console.log(`BROWSER ERROR: "${exception}"`));

    // Set viewport to a nice desktop size for screenshots
    await page.setViewportSize({ width: 1400, height: 900 });

    // 1. Navigate to the app
    await page.goto('/');
    
    // Clear local storage to ensure we are on the landing page
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    // 2. Load Demo Data
    // Wait for the "Try Demo" button to be visible and click it
    await page.getByRole('button', { name: /Try Demo/i }).click();

    // Wait for the board to load (look for a swimlane header)
    await expect(page.getByText('Frontend Development')).toBeVisible();
    
    // Wait a bit for animations to settle
    await page.waitForTimeout(1000);

    // 3. Take Light Mode Screenshot
    await page.screenshot({ path: 'docs/images/showcase-light.png', fullPage: true });

    // 4. Toggle Dark Mode
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    await page.getByRole('menuitem', { name: 'Dark' }).click();
    
    // Wait for theme change
    await page.waitForTimeout(500);

    // 5. Take Dark Mode Screenshot
    await page.screenshot({ path: 'docs/images/showcase-dark.png', fullPage: true });
  });
});
