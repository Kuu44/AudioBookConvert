import { expect, test } from '@playwright/test';

const supportedFile = {
  name: 'chapter-one.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('A short sample chapter for conversion.')
};

const unsupportedFile = {
  name: 'notes.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.7 unsupported sample')
};

test('workflow shell renders in Edge', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('h1')).toHaveText('AudioBookConvert');
  await expect(page.getByRole('heading', { name: 'Upload' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Voice' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Status' })).toBeVisible();

  await expect(page.getByRole('region', { name: 'Upload' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Voice' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Settings' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Status' })).toBeVisible();

  await expect(page.getByRole('status')).toContainText('Start conversion is blocked');
  await expect(page.getByRole('button', { name: 'Start conversion' })).toBeDisabled();
});

test('workflow controls react to supported files and control changes in Edge', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toHaveAttribute('accept', '.txt, .fb2, .epub, .zip');

  await fileInput.setInputFiles(supportedFile);
  await expect(page.getByRole('region', { name: 'Upload' })).toContainText('chapter-one.txt');
  await expect(page.getByRole('region', { name: 'Upload' })).toContainText('TXT');
  await expect(page.getByRole('status')).toContainText('Start conversion is blocked');

  await page.getByRole('combobox', { name: 'Target voice' }).selectOption('en-GB-LibbyNeural');
  await page.getByRole('spinbutton', { name: 'Chunk size' }).fill('1600');
  await page.getByRole('combobox', { name: 'Conversion speed' }).selectOption('Fast');
  await page.getByRole('checkbox', { name: 'Dictionary mode' }).uncheck();

  await expect(page.getByRole('region', { name: 'Voice' })).toContainText('Voice: en-GB-LibbyNeural');
  await expect(page.getByRole('region', { name: 'Voice' })).toContainText('Chunk size: 1600');
  await expect(page.getByRole('region', { name: 'Voice' })).toContainText('Speed: Fast');
  await expect(page.getByRole('region', { name: 'Voice' })).toContainText('Dictionary mode: off');
  await expect(page.getByRole('status')).toContainText('Ready to start conversion.');
  await expect(page.getByRole('button', { name: 'Start conversion' })).toBeEnabled();
});

test('workflow controls reject unsupported file types and preserve the disabled start state in Edge', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const fileInput = page.locator('input[type="file"]');
  await page.waitForSelector('input[type="file"]');
  await fileInput.setInputFiles(unsupportedFile);

  await expect(page.getByRole('alert')).toContainText('Unsupported file type');
  await expect(page.getByRole('button', { name: 'Start conversion' })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('Start conversion is blocked');
});
