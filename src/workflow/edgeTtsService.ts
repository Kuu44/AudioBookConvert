import { sha256 } from './sha256';
import { generateConnectionId } from './uuid';

const WIN_EPOCH = 11644473600;
const S_TO_NS = 1e9;
const KEEP_ALIVE_INTERVAL = 30000;
const CONNECTION_TIMEOUT = 10000;
const REQUEST_TIMEOUT = 180000;

export type EdgeTtsConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'READY' | 'BUSY';

export type EdgeTtsRequest = {
  text: string;
  voice: string;
  pitch: string;
  rate: string;
  volume: string;
};

const EDGE_TTS_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const SEC_MS_GEC_VERSION = '1-143.0.3650.75';
const AUDIO_FORMAT = 'audio-24khz-96kbitrate-mono-mp3';

export class EdgeTtsService {
  private socket: WebSocket | null = null;
  private state: EdgeTtsConnectionState = 'DISCONNECTED';
  private connectPromise: Promise<void> | null = null;
  private keepAliveTimer: number | null = null;
  private requestTimeout: number | null = null;
  private connectionId = '';
  private currentRequestId = '';
  private audioChunks: Blob[] = [];
  private requestResolve: ((data: Uint8Array) => void) | null = null;
  private requestReject: ((error: Error) => void) | null = null;

  getState() {
    return this.state;
  }

  async connect(): Promise<void> {
    if (this.state === 'READY') {
      return;
    }

    if (this.state === 'CONNECTING' && this.connectPromise) {
      return this.connectPromise;
    }

    if (this.state === 'BUSY') {
      throw new Error('Cannot connect while processing a request');
    }

    this.connectPromise = this.doConnect();
    return this.connectPromise;
  }

  private async doConnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.state = 'CONNECTING';
      console.log(`[EdgeTtsService] Connecting... ID: ${this.connectionId}`);
      this.connectionId = generateConnectionId();

      const secMsGec = this.generateSecMsGec();
      const url = `${EDGE_TTS_URL}?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}&ConnectionId=${this.connectionId}`;

      const timeoutId = window.setTimeout(() => {
        this.cleanup();
        reject(new Error('Connection timeout'));
      }, CONNECTION_TIMEOUT);

      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        window.clearTimeout(timeoutId);
        console.log('[EdgeTtsService] WebSocket opened. Sending config...');
        this.sendConfig();
        this.state = 'READY';
        this.startKeepAlive();
        resolve();
      };

      this.socket.onmessage = (event) => {
        void this.handleMessage(event);
      };

      this.socket.onerror = (err) => {
        window.clearTimeout(timeoutId);
        console.error('[EdgeTtsService] WebSocket error:', err);
        this.cleanup();
        reject(new Error('WebSocket connection error'));
      };

      this.socket.onclose = (event) => {
        window.clearTimeout(timeoutId);
        console.log(`[EdgeTtsService] WebSocket closed: ${event.code} ${event.reason}`);
        this.handleClose(event, reject);
      };
    });
  }

  async send(request: EdgeTtsRequest): Promise<Uint8Array> {
    if (this.state === 'DISCONNECTED' || this.state === 'CONNECTING') {
      await this.connect();
    }

    if (this.state === 'BUSY') {
      throw new Error('Connection is busy processing another request');
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    return new Promise<Uint8Array>((resolve, reject) => {
      this.state = 'BUSY';
      this.currentRequestId = generateConnectionId();
      this.audioChunks = [];
      this.requestResolve = resolve;
      this.requestReject = reject;
      console.log(`[EdgeTtsService] Sending synthesis request. ID: ${this.currentRequestId}`);

      this.requestTimeout = window.setTimeout(() => {
        this.rejectRequest(new Error('Request timeout'));
      }, REQUEST_TIMEOUT);

      const timestamp = this.dateToString();
      const ssml = this.makeSSML(request.text, request.voice, request.pitch, request.rate, request.volume);
      const message = this.ssmlHeadersPlusData(this.currentRequestId, timestamp, ssml);

      try {
        this.socket!.send(message);
      } catch (error) {
        this.rejectRequest(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  disconnect(): void {
    this.cleanup();
  }

  isReady(): boolean {
    return this.state === 'READY' && this.socket?.readyState === WebSocket.OPEN;
  }

  private sendConfig(): void {
    const timestamp = this.dateToString();
    const configMessage =
      `X-Timestamp:${timestamp}\r\n` +
      'Content-Type:application/json; charset=utf-8\r\n' +
      'Path:speech.config\r\n\r\n' +
      `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":true},"outputFormat":"${AUDIO_FORMAT}"}}}}\r\n`;

    this.socket?.send(configMessage);
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    const data = event.data;

    if (typeof data === 'string') {
      if (data.includes('Path:turn.end')) {
        console.log(`[EdgeTtsService] Request complete. ID: ${this.currentRequestId}`);
        await this.completeRequest();
      }
      return;
    }

    if (data instanceof Blob) {
      this.audioChunks.push(data);
    }
  }

  private handleClose(event: CloseEvent, connectReject?: (error: Error) => void): void {
    const wasConnecting = this.state === 'CONNECTING';
    const wasBusy = this.state === 'BUSY';

    this.stopKeepAlive();

    if (wasConnecting && connectReject) {
      connectReject(new Error(`WebSocket closed during connection (${event.code})`));
    } else if (wasBusy && this.requestReject) {
      this.rejectRequest(new Error(`WebSocket closed during request (${event.code})`));
    }

    this.state = 'DISCONNECTED';
    this.socket = null;
    this.connectPromise = null;
  }

  private async completeRequest(): Promise<void> {
    if (this.requestTimeout) {
      window.clearTimeout(this.requestTimeout);
      this.requestTimeout = null;
    }

    const audioData = await this.processAudioChunks();
    this.audioChunks = [];
    this.state = 'READY';

    if (audioData.length === 0) {
      this.rejectRequest(new Error('No audio data received'));
      return;
    }

    this.requestResolve?.(audioData);
    this.requestResolve = null;
    this.requestReject = null;
  }

  private rejectRequest(error: Error): void {
    if (this.requestTimeout) {
      window.clearTimeout(this.requestTimeout);
      this.requestTimeout = null;
    }

    this.audioChunks = [];
    this.state = this.socket?.readyState === WebSocket.OPEN ? 'READY' : 'DISCONNECTED';

    this.requestReject?.(error);
    this.requestResolve = null;
    this.requestReject = null;
  }

  private async processAudioChunks(): Promise<Uint8Array> {
    let audioData = new Uint8Array(0);

    for (const chunk of this.audioChunks) {
      const buffer = await chunk.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const posIndex = this.findIndex(uint8Array, new TextEncoder().encode('Path:audio\r\n'));

      if (posIndex !== -1) {
        const partBlob = chunk.slice(posIndex + 'Path:audio\r\n'.length);
        const partBuffer = await partBlob.arrayBuffer();
        const partUint8Array = new Uint8Array(partBuffer);
        const combined = new Uint8Array(audioData.length + partUint8Array.length);
        combined.set(audioData, 0);
        combined.set(partUint8Array, audioData.length);
        audioData = combined;
      }
    }

    return audioData;
  }

  private startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveTimer = window.setInterval(() => {
      if (this.state === 'READY' && this.socket?.readyState === WebSocket.OPEN) {
        const timestamp = this.dateToString();
        const keepAliveMessage =
          `X-RequestId:${generateConnectionId()}\r\n` +
          `X-Timestamp:${timestamp}Z\r\n` +
          'Path:turn.start\r\n\r\n' +
          '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":true},"outputFormat":"' + AUDIO_FORMAT + '"}}}}\r\n';
        this.socket?.send(keepAliveMessage);
      }
    }, KEEP_ALIVE_INTERVAL);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      window.clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private cleanup(): void {
    this.stopKeepAlive();

    if (this.requestTimeout) {
      window.clearTimeout(this.requestTimeout);
      this.requestTimeout = null;
    }

    if (this.socket) {
      console.log('[EdgeTtsService] Closing active WebSocket during cleanup');
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close(1000, 'Cleanup');
      }
      this.socket = null;
    }

    this.state = 'DISCONNECTED';
    this.connectPromise = null;
    this.audioChunks = [];
    this.requestResolve = null;
    this.requestReject = null;
  }

  private dateToString(): string {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    };
    const dateString = date.toLocaleString('en-US', options);
    return `${dateString.replace(/\u200E/g, '')} GMT+0000 (Coordinated Universal Time)`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private makeSSML(text: string, voice: string, pitch: string, rate: string, volume: string): string {
    const escapedText = this.escapeXml(text);
    return (
      "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>\n" +
      `<voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>\n` +
      escapedText +
      '</prosody></voice></speak>'
    );
  }

  private ssmlHeadersPlusData(requestId: string, timestamp: string, ssml: string): string {
    return (
      `X-RequestId:${requestId}\r\n` +
      'Content-Type:application/ssml+xml\r\n' +
      `X-Timestamp:${timestamp}Z\r\n` +
      'Path:ssml\r\n\r\n' +
      ssml
    );
  }

  private generateSecMsGec(): string {
    let ticks = Date.now() / 1000;
    ticks += WIN_EPOCH;
    ticks -= ticks % 300;
    ticks *= S_TO_NS / 100;

    const strToHash = Math.floor(ticks) + TRUSTED_CLIENT_TOKEN;
    return sha256(strToHash).toUpperCase();
  }

  private findIndex(uint8Array: Uint8Array, separator: Uint8Array): number {
    for (let index = 0; index <= uint8Array.length - separator.length; index += 1) {
      let found = true;
      for (let offset = 0; offset < separator.length; offset += 1) {
        if (uint8Array[index + offset] !== separator[offset]) {
          found = false;
          break;
        }
      }
      if (found) {
        return index;
      }
    }

    return -1;
  }
}
