/*  */ /* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
const assert = { ...sinon.assert, ...require('chai').assert };
import { StatsD } from 'hot-shots';
import { AccountEventsManager } from '../../lib/account-events';
import { Container } from 'typedi';
import { AppConfig, AuthFirestore } from '../../lib/types';
import mocks from '../mocks';

const UID = 'uid';

describe('Account Events', () => {
  let usersDbRefMock;
  let firestore;
  let accountEventsManager;
  let addMock;
  let statsd;
  let mockDb;

  beforeEach(() => {
    addMock = sinon.stub();
    usersDbRefMock = {
      doc: sinon.stub().returns({
        collection: sinon.stub().returns({
          add: addMock,
        }),
      }),
    };
    firestore = {
      collection: sinon.stub().returns(usersDbRefMock),
    };
    const mockConfig = {
      authFirestore: {
        enabled: true,
        ebPrefix: 'fxa-eb-',
      },
      accountEvents: {
        enabled: true,
      },
      securityHistory: {
        ipHmacKey: 'cool',
      },
    };
    mockDb = mocks.mockDB();
    Container.set(AppConfig, mockConfig);
    Container.set(AuthFirestore, firestore);
    statsd = { increment: sinon.spy() };
    Container.set(StatsD, statsd);

    accountEventsManager = new AccountEventsManager();
  });

  afterEach(() => {
    Container.reset();
  });

  it('can be instantiated', () => {
    assert.ok(accountEventsManager);
  });

  describe('email events', function () {
    it('can record email event', async () => {
      const message = {
        template: 'verifyLoginCode',
        deviceId: 'deviceId',
        flowId: 'flowId',
        service: 'service',
      };
      await accountEventsManager.recordEmailEvent(UID, message, 'emailSent');

      const assertMessage = {
        ...message,
        eventType: 'emailEvent',
        name: 'emailSent',
      };
      assert.calledOnceWithMatch(addMock, assertMessage);
      assert.calledOnceWithExactly(usersDbRefMock.doc, UID);

      assert.isAtLeast(Date.now(), addMock.firstCall.firstArg.createdAt);
      assert.calledOnceWithExactly(
        statsd.increment,
        'accountEvents.recordEmailEvent.write'
      );
    });

    it('logs and does not throw on failure', async () => {
      usersDbRefMock.doc = sinon.stub().throws();
      const message = {
        template: 'verifyLoginCode',
        deviceId: 'deviceId',
        flowId: 'flowId',
        service: 'service',
      };
      await accountEventsManager.recordEmailEvent(UID, message, 'emailSent');
      assert.isFalse(addMock.called);
      assert.calledOnceWithExactly(
        statsd.increment,
        'accountEvents.recordEmailEvent.error'
      );
    });

    it('strips falsy values', async () => {
      const message = {
        template: null,
        deviceId: undefined,
        flowId: '',
      };
      await accountEventsManager.recordEmailEvent(UID, message, 'emailSent');
      assert.isTrue(addMock.called);
      assert.isUndefined(addMock.firstCall.firstArg.template);
      assert.isUndefined(addMock.firstCall.firstArg.deviceId);
      assert.isUndefined(addMock.firstCall.firstArg.flowId);
    });
  });

  describe('security events', function () {
    it('can record security event', async () => {
      const message = {
        name: 'account.login',
        uid: '000',
        ipAddr: '123.123.123.123',
        tokenId: '123',
      };
      await accountEventsManager.recordSecurityEvent(mockDb, message);

      assert.calledOnceWithExactly(mockDb.securityEvent, message);

      assert.calledOnceWithExactly(
        statsd.increment,
        'accountEvents.recordSecurityEvent.write.account.login'
      );
    });

    it('logs and does not throw on failure', async () => {
      mockDb.securityEvent = sinon.stub().throws();
      const message = {
        name: 'account.login',
        uid: '000',
        ip: '123.123.123.123',
        tokenId: '123',
      };
      await accountEventsManager.recordSecurityEvent(mockDb, message);
      assert.isFalse(addMock.called);
      assert.calledOnceWithExactly(
        statsd.increment,
        'accountEvents.recordSecurityEvent.error.account.login'
      );
    });
  });
});
