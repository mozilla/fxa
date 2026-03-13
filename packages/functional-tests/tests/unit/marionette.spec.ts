/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Unit tests for the Marionette protocol client.
 *
 * Uses a mock TCP server that speaks the Marionette length-prefixed JSON
 * protocol, so no real Firefox is needed.
 */

import { test, expect } from '@playwright/test';
import * as net from 'net';
import { MarionetteClient, MarionetteError } from '../../lib/marionette';

const W3C_ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf';

/** Send a length-prefixed Marionette packet. */
function sendPacket(sock: net.Socket, data: unknown): void {
  const json = JSON.stringify(data);
  sock.write(`${json.length}:${json}`);
}

/** Create a mock Marionette server that handles commands via a handler fn. */
function createMockServer(
  handler: (cmd: string, params: Record<string, unknown>) => unknown
): { server: net.Server; port: number; ready: Promise<void> } {
  const server = net.createServer((sock) => {
    // Send hello on connect
    sendPacket(sock, { applicationType: 'gecko', marionetteProtocol: 3 });

    let buffer = Buffer.alloc(0);
    sock.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      // Try to parse complete packets
      for (;;) {
        const colonIdx = buffer.indexOf(0x3a);
        if (colonIdx === -1) break;
        const lenStr = buffer.subarray(0, colonIdx).toString('utf-8');
        const bodyLen = parseInt(lenStr, 10);
        if (isNaN(bodyLen)) break;
        const total = colonIdx + 1 + bodyLen;
        if (buffer.length < total) break;

        const body = buffer.subarray(colonIdx + 1, total).toString('utf-8');
        buffer = buffer.subarray(total);

        const [type, msgId, cmd, params] = JSON.parse(body);
        if (type !== 0) continue;

        try {
          const result = handler(cmd, params);
          sendPacket(sock, [1, msgId, null, result]);
        } catch (err: unknown) {
          const e = err as { errorType?: string; message?: string };
          sendPacket(sock, [
            1,
            msgId,
            { error: e.errorType || 'unknown error', message: e.message },
            null,
          ]);
        }
      }
    });
  });

  let port = 0;
  const ready = new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      port = (server.address() as net.AddressInfo).port;
      resolve();
    });
  });

  return {
    server,
    get port() {
      return port;
    },
    ready,
  };
}

test.describe('MarionetteClient', () => {
  let server: net.Server;
  let client: MarionetteClient;
  let serverPort: number;

  test.afterEach(async () => {
    client?.close();
    await new Promise<void>((resolve) => {
      if (server?.listening) {
        server.close(() => resolve());
      } else {
        resolve();
      }
    });
  });

  test('connects and receives hello', async () => {
    const mock = createMockServer(() => ({}));
    await mock.ready;
    serverPort = mock.port;
    server = mock.server;

    client = new MarionetteClient('127.0.0.1', serverPort);
    const hello = await client.connect(1, 100);
    expect(hello).toHaveProperty('applicationType', 'gecko');
    expect(hello).toHaveProperty('marionetteProtocol', 3);
  });

  test('sendCommand sends correct protocol format and parses response', async () => {
    const commands: Array<{ cmd: string; params: unknown }> = [];
    const mock = createMockServer((cmd, params) => {
      commands.push({ cmd, params });
      if (cmd === 'WebDriver:NewSession') {
        return { value: { sessionId: 'test-session' } };
      }
      return {};
    });
    await mock.ready;
    serverPort = mock.port;
    server = mock.server;

    client = new MarionetteClient('127.0.0.1', serverPort);
    await client.connect(1, 100);
    const result = await client.newSession();

    expect(commands).toHaveLength(1);
    expect(commands[0].cmd).toBe('WebDriver:NewSession');
    expect(result).toEqual({ value: { sessionId: 'test-session' } });
  });

  test('throws MarionetteError on server error response', async () => {
    const mock = createMockServer((cmd) => {
      if (cmd === 'WebDriver:Navigate') {
        throw { errorType: 'no such window', message: 'Window not found' };
      }
      return {};
    });
    await mock.ready;
    serverPort = mock.port;
    server = mock.server;

    client = new MarionetteClient('127.0.0.1', serverPort);
    await client.connect(1, 100);
    await client.newSession();

    await expect(client.navigate('http://example.com')).rejects.toThrow(
      MarionetteError
    );
    try {
      await client.navigate('http://example.com');
    } catch (err) {
      expect(err).toBeInstanceOf(MarionetteError);
      expect((err as MarionetteError).errorType).toBe('no such window');
    }
  });

  test('findElement extracts W3C element ID', async () => {
    const mock = createMockServer((cmd) => {
      if (cmd === 'WebDriver:FindElement') {
        return { value: { [W3C_ELEMENT_KEY]: 'elem-123' } };
      }
      return {};
    });
    await mock.ready;
    serverPort = mock.port;
    server = mock.server;

    client = new MarionetteClient('127.0.0.1', serverPort);
    await client.connect(1, 100);
    await client.newSession();

    const id = await client.findElement('css selector', '#my-btn');
    expect(id).toBe('elem-123');
  });

  test('findElements returns array of element IDs', async () => {
    const mock = createMockServer((cmd) => {
      if (cmd === 'WebDriver:FindElements') {
        return [{ [W3C_ELEMENT_KEY]: 'a' }, { [W3C_ELEMENT_KEY]: 'b' }];
      }
      return {};
    });
    await mock.ready;
    serverPort = mock.port;
    server = mock.server;

    client = new MarionetteClient('127.0.0.1', serverPort);
    await client.connect(1, 100);
    await client.newSession();

    const ids = await client.findElements('css selector', 'div');
    expect(ids).toEqual(['a', 'b']);
  });

  test('executeScript unwraps value from result', async () => {
    const mock = createMockServer((cmd) => {
      if (cmd === 'WebDriver:ExecuteScript') {
        return { value: 42 };
      }
      return {};
    });
    await mock.ready;
    serverPort = mock.port;
    server = mock.server;

    client = new MarionetteClient('127.0.0.1', serverPort);
    await client.connect(1, 100);
    await client.newSession();

    const result = await client.executeScript('return 42');
    expect(result).toBe(42);
  });

  test('getUrl and getTitle unwrap string values', async () => {
    const mock = createMockServer((cmd) => {
      if (cmd === 'WebDriver:GetCurrentURL') {
        return { value: 'http://localhost/test' };
      }
      if (cmd === 'WebDriver:GetTitle') {
        return { value: 'Test Page' };
      }
      return {};
    });
    await mock.ready;
    serverPort = mock.port;
    server = mock.server;

    client = new MarionetteClient('127.0.0.1', serverPort);
    await client.connect(1, 100);
    await client.newSession();

    expect(await client.getUrl()).toBe('http://localhost/test');
    expect(await client.getTitle()).toBe('Test Page');
  });

  test('throws when not connected', async () => {
    client = new MarionetteClient('127.0.0.1', 1);
    // Don't connect — just call a method
    await expect(client.newSession()).rejects.toThrow('Not connected');
  });

  test('connect retries on failure', async () => {
    // Start server after a delay to test retry
    const mock = createMockServer(() => ({}));
    client = new MarionetteClient('127.0.0.1', 1); // wrong port

    await expect(client.connect(2, 50)).rejects.toThrow();

    // Now connect to a real server
    await mock.ready;
    serverPort = mock.port;
    server = mock.server;
    client = new MarionetteClient('127.0.0.1', serverPort);
    const hello = await client.connect(1, 100);
    expect(hello).toHaveProperty('applicationType');
  });

  test('message ID increments across commands', async () => {
    const mock = createMockServer(() => {
      return { value: 'ok' };
    });
    await mock.ready;
    serverPort = mock.port;
    server = mock.server;

    client = new MarionetteClient('127.0.0.1', serverPort);
    await client.connect(1, 100);
    await client.newSession();

    // Fire several commands sequentially
    await client.executeScript('1');
    await client.executeScript('2');
    await client.executeScript('3');
    // If msgId tracking were broken, one of these would throw
  });

  test.describe('sendCommandWithRetry', () => {
    test('read commands retry on transient errors then succeed', async () => {
      let findAttempt = 0;
      const mock = createMockServer((cmd) => {
        if (cmd === 'WebDriver:FindElement') {
          findAttempt++;
          if (findAttempt <= 2) {
            throw { errorType: 'no such window', message: 'Window not found' };
          }
          return { value: { [W3C_ELEMENT_KEY]: 'elem-retry' } };
        }
        return {};
      });
      await mock.ready;
      serverPort = mock.port;
      server = mock.server;

      client = new MarionetteClient('127.0.0.1', serverPort);
      await client.connect(1, 100);
      await client.newSession();

      const id = await client.findElement('css selector', '#btn');
      expect(id).toBe('elem-retry');
      expect(findAttempt).toBe(3); // 2 failures + 1 success
    });

    test('read commands give up after max retries', async () => {
      const mock = createMockServer((cmd) => {
        if (cmd === 'WebDriver:GetCurrentURL') {
          throw { errorType: 'no such window', message: 'Window gone' };
        }
        return {};
      });
      await mock.ready;
      serverPort = mock.port;
      server = mock.server;

      client = new MarionetteClient('127.0.0.1', serverPort);
      await client.connect(1, 100);
      await client.newSession();

      await expect(client.getUrl()).rejects.toThrow(MarionetteError);
    });

    test('write commands do NOT retry on transient errors', async () => {
      let clickAttempt = 0;
      const mock = createMockServer((cmd) => {
        if (cmd === 'WebDriver:ElementClick') {
          clickAttempt++;
          throw { errorType: 'no such window', message: 'Window not found' };
        }
        return {};
      });
      await mock.ready;
      serverPort = mock.port;
      server = mock.server;

      client = new MarionetteClient('127.0.0.1', serverPort);
      await client.connect(1, 100);
      await client.newSession();

      await expect(client.clickElement('elem-1')).rejects.toThrow(
        MarionetteError
      );
      expect(clickAttempt).toBe(1); // No retries for write commands
    });

    test('non-transient errors are not retried even for read commands', async () => {
      let getUrlAttempt = 0;
      const mock = createMockServer((cmd) => {
        if (cmd === 'WebDriver:GetCurrentURL') {
          getUrlAttempt++;
          throw {
            errorType: 'invalid argument',
            message: 'Bad argument',
          };
        }
        return {};
      });
      await mock.ready;
      serverPort = mock.port;
      server = mock.server;

      client = new MarionetteClient('127.0.0.1', serverPort);
      await client.connect(1, 100);
      await client.newSession();

      await expect(client.getUrl()).rejects.toThrow(MarionetteError);
      expect(getUrlAttempt).toBe(1); // Non-transient error, no retry
    });
  });
});
