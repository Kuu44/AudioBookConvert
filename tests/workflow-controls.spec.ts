import { expect, test, type Page } from '@playwright/test';

const supportedFile = {
  name: 'chapter-one.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('A short sample chapter for conversion.')
};

const repeatedFile = {
  name: 'repeat-source.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from([
    'This chapter opens with a repeated passage that the cleanup pass should collapse before synthesis.',
    'This chapter opens with a repeated passage that the cleanup pass should collapse before synthesis.',
    'This chapter opens with a repeated passage that the cleanup pass should collapse before synthesis.'
  ].join('\n\n'))
};

async function installMockWebSocket(page: Page) {
  await page.addInitScript(() => {
    class FakeWebSocket {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSING = 2;
      static CLOSED = 3;

      url: string;
      readyState = FakeWebSocket.CONNECTING;
      onopen: ((event: Event) => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      onclose: ((event: CloseEvent) => void) | null = null;

      constructor(url: string) {
        this.url = url;
        window.setTimeout(() => {
          this.readyState = FakeWebSocket.OPEN;
          this.onopen?.(new Event('open'));
        }, 0);
      }

      send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        const payload = typeof data === 'string' ? data : '';
        if (payload.includes('Path:ssml')) {
          const encoder = new TextEncoder();
          const audioPayload = new Uint8Array([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
          const chunk = new Blob([encoder.encode('Path:audio\r\n'), audioPayload]);

          window.setTimeout(() => {
            this.onmessage?.({ data: chunk } as MessageEvent);
          }, 5);
          window.setTimeout(() => {
            this.onmessage?.({ data: 'Path:turn.end' } as MessageEvent);
          }, 10);
        }
      }

      close() {
        this.readyState = FakeWebSocket.CLOSED;
        this.onclose?.(new Event('close') as CloseEvent);
      }
    }

    // @ts-expect-error - deliberate test shim
    window.WebSocket = FakeWebSocket;
  });
}

test('workflow controls react to supported files and current settings', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toHaveAttribute('accept', '.txt, .fb2, .epub, .zip');

  await fileInput.setInputFiles(supportedFile);
  await expect(page.locator('.file-info-bar')).toContainText('chapter-one.txt');
  await expect(page.locator('.file-info-bar')).toContainText('TXT ·');
  await expect(page.getByText('Configuration ready. Headset on?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start Conversion' })).toBeEnabled();

  await page.locator('.custom-select-trigger').click();
  await page.getByText('Libby (en-GB, female)', { exact: true }).click();
  await expect(page.locator('.custom-select-trigger')).toContainText('Libby');

  await page.locator('label.toggle-switch').click();
  await page.locator('button[title="Advanced Settings"]').click();

  const workersInput = page.getByRole('spinbutton', { name: 'Number of parallel synthesis workers' });
  const chunkSizeInput = page.getByRole('spinbutton', { name: 'Number of characters per synthesis request' });

  await expect(workersInput).toBeVisible();
  await expect(chunkSizeInput).toBeVisible();
  await expect(workersInput).toBeEnabled();
  await expect(chunkSizeInput).toBeEnabled();

  await workersInput.fill('12');
  await chunkSizeInput.fill('1600');

  await expect(workersInput).toHaveValue('12');
  await expect(chunkSizeInput).toHaveValue('1600');
  await expect(page.getByText('Configuration ready. Headset on?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start Conversion' })).toBeEnabled();
});

test('workflow conversion completes with mocked TTS and surfaces cleanup evidence', async ({ page }) => {
  await installMockWebSocket(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.locator('input[type="file"]').setInputFiles(repeatedFile);
  await expect(page.getByRole('button', { name: 'Start Conversion' })).toBeEnabled();

  await page.getByRole('button', { name: 'Start Conversion' }).click();

  await expect(page.getByRole('heading', { name: 'Audiobook Created!' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Source Cleanup')).toBeVisible();
  await expect(page.getByText('2 repeated blocks removed')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Save Audiobook' })).toHaveAttribute('download', /converted\.mp3$/);
  await expect(page.getByRole('link', { name: 'Save Audiobook' })).toHaveAttribute('href', /blob:/);
});
