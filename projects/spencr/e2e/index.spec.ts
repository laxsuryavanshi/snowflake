import { test } from '@playwright/test';

import { LOGIN_URL } from '../src/lib/constants';

test('it should redirect to login page', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL(LOGIN_URL);
});
