import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { expect, test } from '@playwright/test';

import { prepareSourceText, splitTextIntoChunks } from '../src/workflow/convertToAudio';

const currentDir = dirname(fileURLToPath(import.meta.url));
const repeatedSamplePath = resolve(currentDir, 'fixtures/repeated-sample.txt');

test('repeated source passages are collapsed before synthesis', () => {
  const sourceText = readFileSync(repeatedSamplePath, 'utf8');
  const result = prepareSourceText(sourceText);

  expect(result.report.removedParagraphBlocks).toBeGreaterThan(0);
  expect(result.report.removedParagraphs).toBeGreaterThan(0);
  expect(result.report.removedWordCount).toBeGreaterThan(0);
  expect(result.report.repeatedBlockSamples.length).toBeGreaterThan(0);
  expect(result.report.cleanedWordCount).toBeLessThan(result.report.originalWordCount);
  expect(result.report.cleanedTextLength).toBeLessThan(result.report.originalTextLength);
  expect(result.cleanedText.length).toBeGreaterThan(0);
});

test('chunk splitting preserves whole words and reassembles the cleaned text exactly', () => {
  const sourceText = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi';
  const chunks = splitTextIntoChunks(sourceText, 16);

  expect(chunks.length).toBeGreaterThan(1);
  expect(chunks.every((chunk) => chunk.length > 0)).toBe(true);
  expect(chunks.every((chunk) => chunk.length <= 16)).toBe(true);
  expect(chunks.join(' ')).toBe(sourceText);
  expect(chunks.every((chunk) => !chunk.startsWith(' ') && !chunk.endsWith(' '))).toBe(true);
});

test('cleanup and chunking compose on the real repeated sample input', () => {
  const sourceText = readFileSync(repeatedSamplePath, 'utf8');
  const { cleanedText, report } = prepareSourceText(sourceText);
  const chunks = splitTextIntoChunks(cleanedText, 1200);

  expect(report.removedParagraphBlocks).toBeGreaterThan(0);
  expect(chunks.length).toBeGreaterThan(0);
  expect(chunks.every((chunk) => chunk.length <= 1200)).toBe(true);
  expect(chunks.join(' ')).toBe(cleanedText);
});
