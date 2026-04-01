import path from 'node:path';

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

const largeInputFile = path.resolve('input.txt');

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

  await expect(page.getByRole('status')).toContainText('Shell mounted');
  await expect(page.getByLabel('Supported formats')).toHaveText(/TXT/);
});

test('workflow controls react to supported files and control changes in Edge', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const fileInput = page.locator('input[type="file"]');
  await expect(page.getByRole('heading', { name: 'AudioBookConvert' })).toBeVisible({ timeout: 15000 });
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

test('workflow conversion starts asynchronously and exposes a chunk manifest in Edge', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const fileInput = page.locator('input[type="file"]');
  await expect(page.getByRole('heading', { name: 'AudioBookConvert' })).toBeVisible({ timeout: 15000 });
  await fileInput.setInputFiles(supportedFile);
  await page.getByRole('combobox', { name: 'Target voice' }).selectOption('en-GB-LibbyNeural');
  await page.getByRole('spinbutton', { name: 'Chunk size' }).fill('1600');
  await page.getByRole('combobox', { name: 'Conversion speed' }).selectOption('Fast');
  await page.getByRole('checkbox', { name: 'Dictionary mode' }).uncheck();

  const startButton = page.getByRole('button', { name: 'Start conversion' });
  const conversionGroup = page.getByRole('group', { name: 'Conversion status' });

  await expect(startButton).toBeEnabled();
  const downloadPromise = page.waitForEvent('download');
  await startButton.click();
  const download = await downloadPromise;
  await expect(conversionGroup).toContainText('Conversion complete.');
  await expect(conversionGroup).toContainText('Chunk manifest');
  await expect(conversionGroup).toContainText('chapter-one-chunks.txt');
  await expect(conversionGroup).toContainText('text/plain');
  await expect(conversionGroup).toContainText('blob:http://127.0.0.1:4173/');
  await expect(page.getByRole('link', { name: 'Download manifest' })).toHaveAttribute('download', 'chapter-one-chunks.txt');
  expect(download.suggestedFilename()).toBe('chapter-one-chunks.txt');
  await expect(page.getByText(/^Chunk files \(1\)/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start conversion' })).toBeEnabled();
});

test('workflow accepts a large input and enables chunk manifest conversion in Edge', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(largeInputFile, { timeout: 120000 });
  await page.getByRole('combobox', { name: 'Target voice' }).selectOption('en-GB-LibbyNeural');
  await page.getByRole('spinbutton', { name: 'Chunk size' }).fill('12000');
  await page.getByRole('combobox', { name: 'Conversion speed' }).selectOption('Normal');

  const startButton = page.getByRole('button', { name: 'Start conversion' });

  await expect(page.getByRole('region', { name: 'Upload' })).toContainText('input.txt');
  await expect(page.getByRole('region', { name: 'Settings' })).toContainText('Loaded input.txt');
  await expect(page.getByRole('status')).toContainText('Ready to start conversion.');
  await expect(startButton).toBeEnabled();
});

test('workflow controls reject unsupported file types and preserve the disabled start state in Edge', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const fileInput = page.locator('input[type="file"]');
  await expect(page.getByRole('heading', { name: 'AudioBookConvert' })).toBeVisible({ timeout: 30000 });
  await fileInput.setInputFiles(unsupportedFile);

  await expect(page.getByRole('alert')).toContainText('Unsupported file type');
  await expect(page.getByRole('button', { name: 'Start conversion' })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('Start conversion is blocked');
});
