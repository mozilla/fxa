/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';
import Container from 'typedi';
import { AccountEventsManager } from '../../../../lib/account-events';
import { AppConfig } from '../../../../lib/types';

const {
  isRecognizedDevice,
  recordSecurityEvent,
} = require('../../../../lib/routes/utils/security-event');

describe('recordSecurityEvent', () => {
  let sandbox: sinon.SinonSandbox;
  let mockAccountEventsManager: any;
  let mockConfig: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockAccountEventsManager = {
      recordSecurityEvent: sandbox.stub().resolves(),
    };

    mockConfig = {
      oauth: {
        clientIds: {
          '5882386c6d801776': 'Firefox Desktop',
          dcdb5ae7add825d2: 'Firefox for Android',
        },
      },
    };

    Container.set(AccountEventsManager, mockAccountEventsManager);
    Container.set(AppConfig, mockConfig);
  });

  afterEach(() => {
    sandbox.restore();
    Container.remove(AccountEventsManager);
    Container.remove(AppConfig);
  });

  it('should include client_id when service is in oauth.clientIds allowlist', async () => {
    const opts = {
      db: {},
      account: { uid: 'test-uid' },
      request: {
        app: {
          clientAddress: '127.0.0.1',
          geo: { location: { country: 'US' } },
        },
        headers: { 'user-agent': 'Mozilla/5.0' },
        payload: { service: '5882386c6d801776' },
        auth: { credentials: { id: 'token-id' } },
      },
    };

    await recordSecurityEvent('account.login', opts);

    assert.isTrue(mockAccountEventsManager.recordSecurityEvent.calledOnce);
    const callArgs = mockAccountEventsManager.recordSecurityEvent.firstCall.args;
    assert.equal(callArgs[1].additionalInfo.client_id, '5882386c6d801776');
  });

  it('should include client_id when service is "sync"', async () => {
    const opts = {
      db: {},
      account: { uid: 'test-uid' },
      request: {
        app: {
          clientAddress: '127.0.0.1',
          geo: { location: { country: 'US' } },
        },
        headers: { 'user-agent': 'Mozilla/5.0' },
        payload: { service: 'sync' },
        auth: { credentials: { id: 'token-id' } },
      },
    };

    await recordSecurityEvent('account.login', opts);

    assert.isTrue(mockAccountEventsManager.recordSecurityEvent.calledOnce);
    const callArgs = mockAccountEventsManager.recordSecurityEvent.firstCall.args;
    assert.equal(callArgs[1].additionalInfo.client_id, 'sync');
  });

  it('should not include client_id when service is not in allowlist', async () => {
    const opts = {
      db: {},
      account: { uid: 'test-uid' },
      request: {
        app: {
          clientAddress: '127.0.0.1',
          geo: { location: { country: 'US' } },
        },
        headers: { 'user-agent': 'Mozilla/5.0' },
        payload: { service: 'unknown1234567890' },
        auth: { credentials: { id: 'token-id' } },
      },
    };

    await recordSecurityEvent('account.login', opts);

    assert.isTrue(mockAccountEventsManager.recordSecurityEvent.calledOnce);
    const callArgs = mockAccountEventsManager.recordSecurityEvent.firstCall.args;
    assert.isUndefined(callArgs[1].additionalInfo.client_id);
  });

  it('should not include client_id when service is not a valid hex string', async () => {
    const opts = {
      db: {},
      account: { uid: 'test-uid' },
      request: {
        app: {
          clientAddress: '127.0.0.1',
          geo: { location: { country: 'US' } },
        },
        headers: { 'user-agent': 'Mozilla/5.0' },
        payload: { service: 'not-hex-value' },
        auth: { credentials: { id: 'token-id' } },
      },
    };

    await recordSecurityEvent('account.login', opts);

    assert.isTrue(mockAccountEventsManager.recordSecurityEvent.calledOnce);
    const callArgs = mockAccountEventsManager.recordSecurityEvent.firstCall.args;
    assert.isUndefined(callArgs[1].additionalInfo.client_id);
  });

  it('should not include client_id when service is not provided', async () => {
    const opts = {
      db: {},
      account: { uid: 'test-uid' },
      request: {
        app: {
          clientAddress: '127.0.0.1',
          geo: { location: { country: 'US' } },
        },
        headers: { 'user-agent': 'Mozilla/5.0' },
        payload: {},
        auth: { credentials: { id: 'token-id' } },
      },
    };

    await recordSecurityEvent('account.login', opts);

    assert.isTrue(mockAccountEventsManager.recordSecurityEvent.calledOnce);
    const callArgs = mockAccountEventsManager.recordSecurityEvent.firstCall.args;
    assert.isUndefined(callArgs[1].additionalInfo.client_id);
  });

  it('should get service from query when not in payload', async () => {
    const opts = {
      db: {},
      account: { uid: 'test-uid' },
      request: {
        app: {
          clientAddress: '127.0.0.1',
          geo: { location: { country: 'US' } },
        },
        headers: { 'user-agent': 'Mozilla/5.0' },
        payload: {},
        query: { service: '5882386c6d801776' },
        auth: { credentials: { id: 'token-id' } },
      },
    };

    await recordSecurityEvent('account.login', opts);

    assert.isTrue(mockAccountEventsManager.recordSecurityEvent.calledOnce);
    const callArgs = mockAccountEventsManager.recordSecurityEvent.firstCall.args;
    assert.equal(callArgs[1].additionalInfo.client_id, '5882386c6d801776');
  });

  it('should prefer service from payload over query', async () => {
    const opts = {
      db: {},
      account: { uid: 'test-uid' },
      request: {
        app: {
          clientAddress: '127.0.0.1',
          geo: { location: { country: 'US' } },
        },
        headers: { 'user-agent': 'Mozilla/5.0' },
        payload: { service: 'sync' },
        query: { service: '5882386c6d801776' },
        auth: { credentials: { id: 'token-id' } },
      },
    };

    await recordSecurityEvent('account.login', opts);

    assert.isTrue(mockAccountEventsManager.recordSecurityEvent.calledOnce);
    const callArgs = mockAccountEventsManager.recordSecurityEvent.firstCall.args;
    assert.equal(callArgs[1].additionalInfo.client_id, 'sync');
  });

  it('should not call manager when it is null', async () => {
    Container.set(AccountEventsManager, null);

    const opts = {
      db: {},
      account: { uid: 'test-uid' },
      request: {
        app: {
          clientAddress: '127.0.0.1',
          geo: { location: { country: 'US' } },
        },
        headers: { 'user-agent': 'Mozilla/5.0' },
        payload: { service: 'sync' },
        auth: { credentials: { id: 'token-id' } },
      },
    };

    // Should not throw
    await recordSecurityEvent('account.login', opts);

    assert.isFalse(mockAccountEventsManager.recordSecurityEvent.called);
  });
});

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
    const skipTimeframeMs = 604800000; // 7 days

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000, // 1 hour ago
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

    assert.isTrue(result);
    sinon.assert.calledOnceWithExactly(mockDb.verifiedLoginSecurityEventsByUid, {uid, skipTimeframeMs});
  });

  it('should return false when user agent does not match in verified login events', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const differentUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000; // 7 days

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000, // 1 hour ago
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

    assert.isFalse(result);
  });

  it('should return false when no verified login events exist', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000; // 7 days

    const mockDb = {
      verifiedLoginSecurityEventsByUid: sandbox.stub().resolves([])
    };

    const result = await isRecognizedDevice(mockDb, uid, userAgent, skipTimeframeMs);

    assert.isFalse(result);
  });

  it('should return false when verifiedLoginSecurityEventsByUid returns null', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000; // 7 days

    const mockDb = {
      verifiedLoginSecurityEventsByUid: sandbox.stub().resolves(null)
    };

    const result = await isRecognizedDevice(mockDb, uid, userAgent, skipTimeframeMs);

    assert.isFalse(result);
  });

  it('should handle events with null additionalInfo', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000; // 7 days

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000, // 1 hour ago
        additionalInfo: null
      },
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 7200000, // 2 hours ago
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

    assert.isTrue(result); // Should still find the valid event
  });

  it('should search through multiple events and find match', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000; // 7 days

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
          userAgent, // This one matches
          location: { country: 'US', state: 'TX' }
        })
      }
    ];

    const mockDb = {
      verifiedLoginSecurityEventsByUid: sandbox.stub().resolves(mockEvents)
    };

    const result = await isRecognizedDevice(mockDb, uid, userAgent, skipTimeframeMs);

    assert.isTrue(result);
  });

  it('should handle empty user agent string', async () => {
    const uid = 'test-uid-123';
    const userAgent = '';
    const skipTimeframeMs = 604800000; // 7 days

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

    assert.isTrue(result); // Empty string should match empty string
  });

  it('should handle events with invalid JSON in additionalInfo', async () => {
    const uid = 'test-uid-123';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const skipTimeframeMs = 604800000; // 7 days

    const mockEvents = [
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 3600000, // 1 hour ago
        additionalInfo: 'invalid json'
      },
      {
        name: 'account.login',
        verified: true,
        createdAt: Date.now() - 7200000, // 2 hours ago
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

    assert.isTrue(result); // Should skip invalid JSON and find the valid event
  });
});
