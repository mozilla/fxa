/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Migrated from test/local/routes/utils/security-event.ts (Mocha → Jest).
 */

import sinon from 'sinon';

const { isRecognizedDevice } = require('./security-event');

describe('isRecognizedDevice', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return true when user agent matches in verified login events', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000,
        additionalInfo: JSON.stringify({
          userAgent,
          location: { country: 'US', state: 'CA' }
        })
      }
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: sandbox.stub().resolves(mockEvents)
    };

    const result = await isRecognizedDevice(mockDb, uid, userAgent, skipTimeframeMs);

    expect(result).toBe(true);
    sinon.assert.calledOnceWithExactly(mockDb.verifiedLoginSecurityEventsByUid, {uid, skipTimeframeMs});
  });

  it('should return false when user agent does not match in verified login events', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const differentUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000,
        additionalInfo: JSON.stringify({
          userAgent: differentUserAgent,
          location: { country: 'US', state: 'CA' }
        })
      }
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: sandbox.stub().resolves(mockEvents)
    };

    const result = await isRecognizedDevice(mockDb, uid, userAgent, skipTimeframeMs);

    expect(result).toBe(false);
  });

  it('should return false when no verified login events exist', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockDb = {
      verifiedLoginSecurityEventsByUid: sandbox.stub().resolves([])
    };

    const result = await isRecognizedDevice(mockDb, uid, userAgent, skipTimeframeMs);

    expect(result).toBe(false);
  });

  it('should return false when verifiedLoginSecurityEventsByUid returns null', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockDb = {
      verifiedLoginSecurityEventsByUid: sandbox.stub().resolves(null)
    };

    const result = await isRecognizedDevice(mockDb, uid, userAgent, skipTimeframeMs);

    expect(result).toBe(false);
  });

  it('should handle events with null additionalInfo', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000,
        additionalInfo: null
      },
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 7200000,
        additionalInfo: JSON.stringify({
          userAgent,
          location: { country: 'US', state: 'CA' }
        })
      }
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: sandbox.stub().resolves(mockEvents)
    };

    const result = await isRecognizedDevice(mockDb, uid, userAgent, skipTimeframeMs);

    expect(result).toBe(true);
  });

  it('should search through multiple events and find match', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000,
        additionalInfo: JSON.stringify({
          userAgent: 'Different User Agent 1',
          location: { country: 'US', state: 'CA' }
        })
      },
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 7200000,
        additionalInfo: JSON.stringify({
          userAgent: 'Different User Agent 2',
          location: { country: 'US', state: 'NY' }
        })
      },
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 10800000,
        additionalInfo: JSON.stringify({
          userAgent,
          location: { country: 'US', state: 'TX' }
        })
      }
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: sandbox.stub().resolves(mockEvents)
    };

    const result = await isRecognizedDevice(mockDb, uid, userAgent, skipTimeframeMs);

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
          location: { country: 'US', state: 'CA' }
        })
      }
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: sandbox.stub().resolves(mockEvents)
    };

    const result = await isRecognizedDevice(mockDb, uid, userAgent, skipTimeframeMs);

    expect(result).toBe(true);
  });

  it('should handle events with invalid JSON in additionalInfo', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000;

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000,
        additionalInfo: 'invalid json'
      },
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 7200000,
        additionalInfo: JSON.stringify({
          userAgent,
          location: { country: 'US', state: 'CA' }
        })
      }
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: sandbox.stub().resolves(mockEvents)
    };

    const result = await isRecognizedDevice(mockDb, uid, userAgent, skipTimeframeMs);

    expect(result).toBe(true);
  });
});
