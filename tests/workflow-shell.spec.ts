import { expect, test } from '@playwright/test';

test('workflow shell renders the current layout', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'AudioBookConvert' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('1. Preparation')).toBeVisible();
  await expect(page.getByText('2. Configuration')).toBeVisible();
  await expect(page.getByText('Sonic Optimization Pipeline')).toBeVisible();
  await expect(page.getByText('Drop files here or click to browse')).toBeVisible();
  await expect(page.getByText('TXT · FB2 · EPUB · ZIP')).toBeVisible();
  await expect(page.getByRole('button', { name: 'File' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Text' })).toBeVisible();
  await expect(page.locator('input[type="file"]')).toHaveAttribute('accept', '.txt, .fb2, .epub, .zip');
  await expect(page.getByText('⚠️ Select a file and voice to unlock conversion')).toBeVisible();
});
