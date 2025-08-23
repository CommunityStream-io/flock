import { test, expect } from '@playwright/test';

test('navigates to auth step and renders content', async ({ page }) => {
  await page.goto('/');
  await page.goto('/step/auth');
  await expect(page.getByText('auth works!')).toBeVisible({ timeout: 30000 });
});