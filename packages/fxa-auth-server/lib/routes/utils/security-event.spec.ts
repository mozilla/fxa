/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

jest.mock('typedi', () => ({
  Container: { get: jest.fn() },
  Token: class Token {
    constructor(public name: string) {}
  },
}));

const { Container } = require('typedi');
const { isRecognizedDevice, recordSecurityEvent } = require('./security-event');

function makeOpts(extraHeaders: Record<string, string> = {}) {
  return {
    db: {},
    account: { uid: 'test-uid' },
    request: {
      headers: { 'user-agent': 'TestAgent/1.0', ...extraHeaders },
      app: {
        clientIdTag: undefined,
        serviceTag: undefined,
        clientAddress: '127.0.0.1',
        geo: { location: { city: 'Portland', country: 'US' } },
      },
      auth: { credentials: { uid: 'test-uid', id: 'token-id' } },
    },
  };
}

describe('isRecognizedDevice', () => {
  beforeEach(() => {});

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return true when user agent matches in verified login events', async () => {
    const uid = 'test-uid-123';
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000,
        additionalInfo: JSON.stringify({
          userAgent,
          location: { country: 'US', state: 'CA' },
        }),
      },
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: jest.fn().mockResolvedValue(mockEvents),
    };

    const result = await isRecognizedDevice(
      mockDb,
      uid,
      userAgent,
      skipTimeframeMs
    );

    expect(result).toBe(true);
    expect(mockDb.verifiedLoginSecurityEventsByUid).toHaveBeenCalledTimes(1);
    expect(mockDb.verifiedLoginSecurityEventsByUid).toHaveBeenCalledWith({
      uid,
      skipTimeframeMs,
    });
  });

  it('should return false when user agent does not match in verified login events', async () => {
    const uid = 'test-uid-123';
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const differentUserAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000,
        additionalInfo: JSON.stringify({
          userAgent: differentUserAgent,
          location: { country: 'US', state: 'CA' },
        }),
      },
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: jest.fn().mockResolvedValue(mockEvents),
    };

    const result = await isRecognizedDevice(
      mockDb,
      uid,
      userAgent,
      skipTimeframeMs
    );

    expect(result).toBe(false);
  });

  it('should return false when no verified login events exist', async () => {
    const uid = 'test-uid-123';
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockDb = {
      verifiedLoginSecurityEventsByUid: jest.fn().mockResolvedValue([]),
    };

    const result = await isRecognizedDevice(
      mockDb,
      uid,
      userAgent,
      skipTimeframeMs
    );

    expect(result).toBe(false);
  });

  it('should return false when verifiedLoginSecurityEventsByUid returns null', async () => {
    const uid = 'test-uid-123';
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockDb = {
      verifiedLoginSecurityEventsByUid: jest.fn().mockResolvedValue(null),
    };

    const result = await isRecognizedDevice(
      mockDb,
      uid,
      userAgent,
      skipTimeframeMs
    );

    expect(result).toBe(false);
  });

  it('should handle events with null additionalInfo', async () => {
    const uid = 'test-uid-123';
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000,
        additionalInfo: null,
      },
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 7200000,
        additionalInfo: JSON.stringify({
          userAgent,
          location: { country: 'US', state: 'CA' },
        }),
      },
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: jest.fn().mockResolvedValue(mockEvents),
    };

    const result = await isRecognizedDevice(
      mockDb,
      uid,
      userAgent,
      skipTimeframeMs
    );

    expect(result).toBe(true);
  });

  it('should search through multiple events and find match', async () => {
    const uid = 'test-uid-123';
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000,
        additionalInfo: JSON.stringify({
          userAgent: 'Different User Agent 1',
          location: { country: 'US', state: 'CA' },
        }),
      },
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 7200000,
        additionalInfo: JSON.stringify({
          userAgent: 'Different User Agent 2',
          location: { country: 'US', state: 'NY' },
        }),
      },
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 10800000,
        additionalInfo: JSON.stringify({
          userAgent,
          location: { country: 'US', state: 'TX' },
        }),
      },
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: jest.fn().mockResolvedValue(mockEvents),
    };

    const result = await isRecognizedDevice(
      mockDb,
      uid,
      userAgent,
      skipTimeframeMs
    );

    expect(result).toBe(true);
  });

  it('should handle empty user agent string', async () => {
    const uid = 'test-uid-123';
    const userAgent = '';
    const skipTimeframeMs = 604800000;

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000,
        additionalInfo: JSON.stringify({
          userAgent: '',
          location: { country: 'US', state: 'CA' },
        }),
      },
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: jest.fn().mockResolvedValue(mockEvents),
    };

    const result = await isRecognizedDevice(
      mockDb,
      uid,
      userAgent,
      skipTimeframeMs
    );

    expect(result).toBe(true);
  });

  it('should handle events with invalid JSON in additionalInfo', async () => {
    const uid = 'test-uid-123';
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000,
        additionalInfo: 'invalid json',
      },
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 7200000,
        additionalInfo: JSON.stringify({
          userAgent,
          location: { country: 'US', state: 'CA' },
        }),
      },
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: jest.fn().mockResolvedValue(mockEvents),
    };

    const result = await isRecognizedDevice(
      mockDb,
      uid,
      userAgent,
      skipTimeframeMs
    );

    expect(result).toBe(true);
  });
});

describe('recordSecurityEvent', () => {
  let mockMgrRecordSecurityEvent: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockMgrRecordSecurityEvent = jest.fn().mockResolvedValue(undefined);
    Container.get.mockReturnValue({
      recordSecurityEvent: mockMgrRecordSecurityEvent,
    });
  });

  it('includes all WAF headers in additionalInfo.waf when present', async () => {
    const opts = makeOpts({
      'client-ja4': 't13d1516h2_test',
      'client-ja3': 'abcdef123456',
      'x-fastly-request-id': 'fastly-req-123',
      'x-sigsci-requestid': 'sigsci-req-456',
      'x-sigsci-tags': 'SQLI,BOT-CHALLENGED',
    });

    await recordSecurityEvent('account.login', opts);

    expect(mockMgrRecordSecurityEvent).toHaveBeenCalledWith(
      opts.db,
      expect.objectContaining({
        additionalInfo: expect.objectContaining({
          waf: expect.objectContaining({
            clientJa4: 't13d1516h2_test',
            clientJa3: 'abcdef123456',
            fastlyRequestId: 'fastly-req-123',
            sigsciRequestId: 'sigsci-req-456',
            sigsciTags: 'SQLI,BOT-CHALLENGED',
          }),
        }),
      })
    );
  });

  it('omits waf from additionalInfo when no WAF headers are present', async () => {
    await recordSecurityEvent('account.login', makeOpts());

    const [, message] = mockMgrRecordSecurityEvent.mock.calls[0];
    expect(message.additionalInfo.waf).toBeUndefined();
  });

  it('includes waf when only some WAF headers are present', async () => {
    const opts = makeOpts({
      'client-ja4': 't13d1516h2_partial',
      'x-sigsci-tags': 'TRAVERSAL',
    });

    await recordSecurityEvent('account.login', opts);

    const [, message] = mockMgrRecordSecurityEvent.mock.calls[0];
    expect(message.additionalInfo.waf).toMatchObject({
      clientJa4: 't13d1516h2_partial',
      sigsciTags: 'TRAVERSAL',
    });
  });
});
