import { expect, test } from '@playwright/test';

test('workflow shell renders in Edge', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'AudioBookConvert' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Upload' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Voice' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Status' })).toBeVisible();

  await expect(page.getByRole('region', { name: 'Upload' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Voice' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Settings' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Status' })).toBeVisible();

  await expect(page.getByRole('status')).toContainText('Shell mounted');
  await expect(page.getByLabel('Supported formats')).toHaveText(/TXT/);
});
