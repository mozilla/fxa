/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import { AccountEventsManager } from './account-events';
import Container from 'typedi';
import { AppConfig, AuthFirestore } from './types';

const mocks = require('../test/mocks');

const UID = 'uid';

describe('Account Events', () => {
  let usersDbRefMock: any;
  let firestore: any;
  let accountEventsManager: AccountEventsManager;
  let addMock: jest.Mock;
  let statsd: any;
  let mockDb: any;

  beforeEach(() => {
    addMock = jest.fn();
    usersDbRefMock = {
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          add: addMock,
        }),
      }),
    };
    firestore = {
      collection: jest.fn().mockReturnValue(usersDbRefMock),
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
    statsd = { increment: jest.fn() };
    Container.set(StatsD, statsd);

    accountEventsManager = new AccountEventsManager();
  });

  afterEach(() => {
    Container.reset();
  });

  it('can be instantiated', () => {
    expect(accountEventsManager).toBeTruthy();
  });

  describe('email events', () => {
    it('can record email event', async () => {
      const message = {
        template: 'verifyLoginCode',
        deviceId: 'deviceId',
        flowId: 'flowId',
        service: 'service',
      };
      await accountEventsManager.recordEmailEvent(
        UID,
        message as any,
        'emailSent'
      );

      const assertMessage = {
        ...message,
        eventType: 'emailEvent',
        name: 'emailSent',
      };
      expect(addMock).toHaveBeenCalledTimes(1);
      expect(addMock).toHaveBeenCalledWith(
        expect.objectContaining(assertMessage)
      );
      expect(usersDbRefMock.doc).toHaveBeenCalledTimes(1);
      expect(usersDbRefMock.doc).toHaveBeenCalledWith(UID);

      expect(Date.now()).toBeGreaterThanOrEqual(
        addMock.mock.calls[0][0].createdAt
      );
      expect(statsd.increment).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(
        'accountEvents.recordEmailEvent.write'
      );
    });

    it('logs and does not throw on failure', async () => {
      usersDbRefMock.doc = jest.fn().mockImplementation(() => {
        throw new Error();
      });
      const message = {
        template: 'verifyLoginCode',
        deviceId: 'deviceId',
        flowId: 'flowId',
        service: 'service',
      };
      await accountEventsManager.recordEmailEvent(
        UID,
        message as any,
        'emailSent'
      );
      expect(addMock).not.toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(
        'accountEvents.recordEmailEvent.error'
      );
    });

    it('strips falsy values', async () => {
      const message = {
        template: null,
        deviceId: undefined,
        flowId: '',
      };
      await accountEventsManager.recordEmailEvent(
        UID,
        message as any,
        'emailSent'
      );
      expect(addMock).toHaveBeenCalled();
      expect(addMock.mock.calls[0][0].template).toBeUndefined();
      expect(addMock.mock.calls[0][0].deviceId).toBeUndefined();
      expect(addMock.mock.calls[0][0].flowId).toBeUndefined();
    });
  });

  describe('security events', () => {
    it('can record security event', async () => {
      const message = {
        name: 'account.login',
        uid: '000',
        ipAddr: '123.123.123.123',
        tokenId: '123',
      };
      await accountEventsManager.recordSecurityEvent(mockDb, message);

      expect(mockDb.securityEvent).toHaveBeenCalledTimes(1);
      expect(mockDb.securityEvent).toHaveBeenCalledWith(message);

      expect(statsd.increment).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(
        'accountEvents.recordSecurityEvent.write.account.login',
        { clientId: 'none', service: 'none' }
      );
    });

    it('includes clientId and service tags from additionalInfo', async () => {
      const message = {
        name: 'account.login',
        uid: '000',
        ipAddr: '123.123.123.123',
        tokenId: '123',
        additionalInfo: {
          client_id: '5882386c6d801776',
          service: 'sync',
        },
      };
      await accountEventsManager.recordSecurityEvent(mockDb, message);

      expect(statsd.increment).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(
        'accountEvents.recordSecurityEvent.write.account.login',
        { clientId: '5882386c6d801776', service: 'sync' }
      );
    });

    it('uses none for missing service when clientId is present', async () => {
      const message = {
        name: 'account.login',
        uid: '000',
        ipAddr: '123.123.123.123',
        tokenId: '123',
        additionalInfo: {
          client_id: 'deadbeefdeadbeef',
        },
      };
      await accountEventsManager.recordSecurityEvent(mockDb, message);

      expect(statsd.increment).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(
        'accountEvents.recordSecurityEvent.write.account.login',
        { clientId: 'deadbeefdeadbeef', service: 'none' }
      );
    });

    it('logs and does not throw on failure', async () => {
      mockDb.securityEvent = jest.fn().mockImplementation(() => {
        throw new Error();
      });
      const message = {
        name: 'account.login',
        uid: '000',
        ip: '123.123.123.123',
        tokenId: '123',
      };
      await accountEventsManager.recordSecurityEvent(mockDb, message as any);
      expect(addMock).not.toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(
        'accountEvents.recordSecurityEvent.error.account.login',
        { clientId: 'none', service: 'none' }
      );
    });

    it('includes tags on error path', async () => {
      mockDb.securityEvent = jest.fn().mockImplementation(() => {
        throw new Error();
      });
      const message = {
        name: 'account.login',
        uid: '000',
        ipAddr: '123.123.123.123',
        tokenId: '123',
        additionalInfo: {
          client_id: '5882386c6d801776',
          service: 'sync',
        },
      };
      await accountEventsManager.recordSecurityEvent(mockDb, message as any);

      expect(statsd.increment).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(
        'accountEvents.recordSecurityEvent.error.account.login',
        { clientId: '5882386c6d801776', service: 'sync' }
      );
    });
  });
});
