/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Minimal Marionette protocol client over raw TCP.
 *
 * Protocol: length-prefixed JSON messages.
 *   Send:    [0, msgId, commandName, params]
 *   Receive: [1, msgId, error, result]
 *
 * Zero dependencies — uses only Node's `net` module.
 */

import * as net from 'net';

// W3C WebDriver element identifier key
const W3C_ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf';

export type MarionetteContext = 'chrome' | 'content';

export class MarionetteError extends Error {
  constructor(
    public readonly errorType: string,
    message: string
  ) {
    super(`Marionette error: ${errorType}: ${message}`);
    this.name = 'MarionetteError';
  }
}

export class MarionetteClient {
  private sock: net.Socket | null = null;
  private msgId = 0;
  private buffer = Buffer.alloc(0);
  private pendingResolve: ((data: string) => void) | null = null;
  private pendingReject: ((err: Error) => void) | null = null;

  constructor(
    private host = '127.0.0.1',
    private port = 2828
  ) {}

  /**
   * Connect to Marionette with retries — Marionette may accept TCP before it's ready.
   */
  async connect(
    retries = 10,
    delay = 2000
  ): Promise<Record<string, unknown>> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (this.sock) {
          this.sock.destroy();
          this.sock = null;
        }
        this.buffer = Buffer.alloc(0);

        await this.rawConnect();
        const helloRaw = await this.recvPacket();
        return JSON.parse(helloRaw);
      } catch (err) {
        if (attempt < retries - 1) {
          await this.sleep(delay);
        } else {
          throw err;
        }
      }
    }
    throw new Error('Failed to connect to Marionette');
  }

  private rawConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      let connected = false;
      this.sock = new net.Socket();
      this.sock.setTimeout(15000);

      this.sock.on('data', (chunk) => {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        this.tryDeliverPacket();
      });

      this.sock.on('error', (err) => {
        if (!connected) {
          // Pre-connect: reject the connection promise
          reject(err);
        } else if (this.pendingReject) {
          // Post-connect: reject the pending command promise
          this.pendingReject(err);
          this.pendingResolve = null;
          this.pendingReject = null;
        }
      });

      this.sock.on('close', () => {
        if (this.pendingReject) {
          this.pendingReject(new Error('Socket closed'));
          this.pendingResolve = null;
          this.pendingReject = null;
        }
      });

      this.sock.connect(this.port, this.host, () => {
        connected = true;
        resolve();
      });
    });
  }

  /**
   * Try to extract a complete packet from the buffer.
   * Packet format: "LENGTH:JSON_BODY"
   */
  private tryDeliverPacket(): void {
    if (!this.pendingResolve) return;

    const colonIdx = this.buffer.indexOf(0x3a); // ':'
    if (colonIdx === -1) return;

    const lengthStr = this.buffer.subarray(0, colonIdx).toString('utf-8');
    const bodyLength = parseInt(lengthStr, 10);
    if (isNaN(bodyLength)) {
      this.pendingReject?.(new Error(`Invalid length prefix: ${lengthStr}`));
      this.pendingResolve = null;
      this.pendingReject = null;
      return;
    }

    const totalLength = colonIdx + 1 + bodyLength;
    if (this.buffer.length < totalLength) return;

    const body = this.buffer
      .subarray(colonIdx + 1, totalLength)
      .toString('utf-8');
    this.buffer = this.buffer.subarray(totalLength);

    const resolve = this.pendingResolve;
    this.pendingResolve = null;
    this.pendingReject = null;
    resolve(body);
  }

  private recvPacket(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.pendingResolve = resolve;
      this.pendingReject = reject;
      // Check if we already have data buffered
      this.tryDeliverPacket();
    });
  }

  private async sendCommand(
    name: string,
    params: Record<string, unknown> = {}
  ): Promise<unknown> {
    if (!this.sock) throw new Error('Not connected');

    this.msgId++;
    const expectedId = this.msgId;
    const msg = JSON.stringify([0, expectedId, name, params]);
    const packet = `${msg.length}:${msg}`;
    this.sock.write(packet, 'utf-8');

    const raw = await this.recvPacket();
    const data = JSON.parse(raw) as [number, number, unknown, unknown];

    if (data[0] !== 1) {
      throw new Error(`Expected response type 1, got ${data[0]}`);
    }

    if (data[1] !== expectedId) {
      throw new Error(
        `Response message ID mismatch: expected ${expectedId}, got ${data[1]}`
      );
    }

    if (data[2]) {
      const error = data[2] as { error?: string; message?: string };
      throw new MarionetteError(
        error.error ?? '?',
        error.message ?? '?'
      );
    }

    return data[3];
  }

  // ── Session management ──

  async newSession(): Promise<unknown> {
    return this.sendCommand('WebDriver:NewSession', {
      capabilities: {
        alwaysMatch: { acceptInsecureCerts: true },
      },
    });
  }

  async deleteSession(): Promise<void> {
    try {
      await this.sendCommand('WebDriver:DeleteSession');
    } catch {
      // Ignore errors during session deletion
    }
  }

  async setContext(context: MarionetteContext): Promise<void> {
    await this.sendCommand('Marionette:SetContext', { value: context });
  }

  // ── Script execution ──

  async executeScript(
    script: string,
    options: {
      args?: unknown[];
      sandbox?: string;
      newSandbox?: boolean;
    } = {}
  ): Promise<unknown> {
    const result = await this.sendCommand('WebDriver:ExecuteScript', {
      script,
      args: options.args ?? [],
      sandbox: options.sandbox ?? 'default',
      newSandbox: options.newSandbox ?? true,
    });
    return this.extractValue(result);
  }

  async executeAsyncScript(
    script: string,
    options: {
      args?: unknown[];
      sandbox?: string;
      newSandbox?: boolean;
      timeoutMs?: number;
    } = {}
  ): Promise<unknown> {
    await this.sendCommand('WebDriver:SetTimeouts', {
      script: options.timeoutMs ?? 30000,
    });
    const result = await this.sendCommand(
      'WebDriver:ExecuteAsyncScript',
      {
        script,
        args: options.args ?? [],
        sandbox: options.sandbox ?? 'default',
        newSandbox: options.newSandbox ?? true,
      }
    );
    return this.extractValue(result);
  }

  // ── Navigation ──

  async navigate(url: string): Promise<void> {
    await this.sendCommand('WebDriver:Navigate', { url });
  }

  async getUrl(): Promise<string> {
    const result = await this.sendCommand('WebDriver:GetCurrentURL');
    return this.extractValue(result) as string;
  }

  async getTitle(): Promise<string> {
    const result = await this.sendCommand('WebDriver:GetTitle');
    return this.extractValue(result) as string;
  }

  // ── Alert handling ──

  async dismissAlert(): Promise<void> {
    await this.sendCommand('WebDriver:DismissAlert');
  }

  async acceptAlert(): Promise<void> {
    await this.sendCommand('WebDriver:AcceptAlert');
  }

  // ── Element interaction ──

  async findElement(using: string, value: string): Promise<string> {
    const result = await this.sendCommand('WebDriver:FindElement', {
      using,
      value,
    });
    return this.extractElementId(result);
  }

  async findElements(using: string, value: string): Promise<string[]> {
    const result = await this.sendCommand('WebDriver:FindElements', {
      using,
      value,
    });
    if (!Array.isArray(result)) return [];
    return result.map((el) => this.extractElementId(el));
  }

  async clickElement(elementId: string): Promise<void> {
    await this.sendCommand('WebDriver:ElementClick', { id: elementId });
  }

  async sendKeys(elementId: string, text: string): Promise<void> {
    await this.sendCommand('WebDriver:ElementSendKeys', {
      id: elementId,
      text,
    });
  }

  async clearElement(elementId: string): Promise<void> {
    await this.sendCommand('WebDriver:ElementClear', { id: elementId });
  }

  async getElementText(elementId: string): Promise<string> {
    const result = await this.sendCommand('WebDriver:GetElementText', {
      id: elementId,
    });
    return this.extractValue(result) as string;
  }

  async getElementAttribute(
    elementId: string,
    name: string
  ): Promise<string | null> {
    const result = await this.sendCommand(
      'WebDriver:GetElementAttribute',
      { id: elementId, name }
    );
    return this.extractValue(result) as string | null;
  }

  // ── Cleanup ──

  close(): void {
    if (this.sock) {
      this.sock.destroy();
      this.sock = null;
    }
  }

  // ── Helpers ──

  private extractValue(result: unknown): unknown {
    if (result && typeof result === 'object' && 'value' in result) {
      return (result as Record<string, unknown>).value;
    }
    return result;
  }

  private extractElementId(result: unknown): string {
    if (!result || typeof result !== 'object') {
      return String(result);
    }

    const obj = result as Record<string, unknown>;

    // Direct W3C element reference: { "element-6066-...": "id" }
    if (W3C_ELEMENT_KEY in obj) {
      return obj[W3C_ELEMENT_KEY] as string;
    }

    // Wrapped in value: { value: { "element-6066-...": "id" } }
    const val = obj.value;
    if (val && typeof val === 'object' && W3C_ELEMENT_KEY in val) {
      return (val as Record<string, string>)[W3C_ELEMENT_KEY];
    }

    return String(result);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
