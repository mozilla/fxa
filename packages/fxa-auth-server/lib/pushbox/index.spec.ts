/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

import sinon from 'sinon';

const sandbox = sinon.createSandbox();

const { pushboxApi } = require('./index');
const pushboxDbModule = require('./db');
const { AppError: error } = require('@fxa/accounts/errors');
const { mockLog } = require('../../test/mocks');
let mockStatsD: { increment: sinon.SinonStub; timing: sinon.SinonStub };

const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  pushbox: {
    enabled: true,
    maxTTL: 123456000,
    database: {
      database: 'pushbox',
      host: 'example.local',
      password: '',
      port: 3306,
      user: 'root',
      connectionLimitMin: 2,
      connectionLimitMax: 10,
      acquireTimeoutMillis: 30000,
    },
  },
};
const mockDeviceIds = ['AAAA11', 'BBBB22', 'CCCC33'];
const mockData = 'eyJmb28iOiAiYmFyIn0';
const mockUid = 'ABCDEF';

interface PushboxError extends Error {
  errno: number;
}

describe('pushbox', () => {
  describe('using direct Pushbox database access', () => {
    let stubDbModule: sinon.SinonStubbedInstance<typeof pushboxDbModule.PushboxDB>;
    let stubConstructor: sinon.SinonStub;

    beforeEach(() => {
      mockStatsD = { increment: sandbox.stub(), timing: sandbox.stub() };
      stubDbModule = sandbox.createStubInstance(pushboxDbModule.PushboxDB);
      stubConstructor = sandbox
        .stub(pushboxDbModule, 'PushboxDB')
        .returns(stubDbModule);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('store', () => {
      sandbox.stub(Date, 'now').returns(1000534);
      stubDbModule.store.resolves({ idx: 12 });
      const pushbox = pushboxApi(
        mockLog(),
        mockConfig,
        mockStatsD,
        stubConstructor
      );
      return pushbox
        .store(mockUid, mockDeviceIds[0], { test: 'data' })
        .then(({ index }: { index: number }) => {
          sinon.assert.calledOnceWithExactly(stubDbModule.store, {
            uid: mockUid,
            deviceId: mockDeviceIds[0],
            data: 'eyJ0ZXN0IjoiZGF0YSJ9',
            ttl: 124457,
          });
          sinon.assert.calledOnce(mockStatsD.timing);
          expect(mockStatsD.timing.args[0][0]).toBe(
            'pushbox.db.store.success'
          );
          sinon.assert.calledOnceWithExactly(
            mockStatsD.increment,
            'pushbox.db.store'
          );
          expect(index).toBe(12);
        });
    });

    it('store with custom ttl', () => {
      sandbox.stub(Date, 'now').returns(1000534);
      stubDbModule.store.resolves({ idx: 12 });
      const pushbox = pushboxApi(
        mockLog(),
        mockConfig,
        mockStatsD,
        stubConstructor
      );
      return pushbox
        .store(mockUid, mockDeviceIds[0], { test: 'data' }, 42)
        .then(({ index }: { index: number }) => {
          sinon.assert.calledOnceWithExactly(stubDbModule.store, {
            uid: mockUid,
            deviceId: mockDeviceIds[0],
            data: 'eyJ0ZXN0IjoiZGF0YSJ9',
            ttl: 1043,
          });
          expect(index).toBe(12);
        });
    });

    it('store caps ttl at configured maximum', () => {
      sandbox.stub(Date, 'now').returns(1000432);
      stubDbModule.store.resolves({ idx: 12 });
      const pushbox = pushboxApi(
        mockLog(),
        mockConfig,
        mockStatsD,
        stubConstructor
      );
      return pushbox
        .store(mockUid, mockDeviceIds[0], { test: 'data' }, 999999999)
        .then(({ index }: { index: number }) => {
          sinon.assert.calledOnceWithExactly(stubDbModule.store, {
            uid: mockUid,
            deviceId: mockDeviceIds[0],
            data: 'eyJ0ZXN0IjoiZGF0YSJ9',
            ttl: 124457,
          });
          expect(index).toBe(12);
        });
    });

    it('logs an error when failed to store', () => {
      stubDbModule.store.rejects(new Error('db is a mess right now'));
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      return pushbox
        .store(mockUid, mockDeviceIds[0], { test: 'data' }, 999999999)
        .then(
          () => {
            throw new Error('should not happen');
          },
          (err: PushboxError) => {
            expect(err).toBeTruthy();
            expect(err.errno).toBe(error.ERRNO.UNEXPECTED_ERROR);
            sinon.assert.calledOnce(log.error);
            expect(log.error.args[0][0]).toBe('pushbox.db.store');
            expect(log.error.args[0][1]['error']['message']).toBe(
              'db is a mess right now'
            );
          }
        );
    });

    it('retrieve', () => {
      stubDbModule.retrieve.resolves({
        last: true,
        index: 15,
        messages: [
          {
            idx: 15,
            data: 'eyJmb28iOiJiYXIiLCAiYmFyIjogImJhciJ9',
          },
        ],
      });
      const pushbox = pushboxApi(
        mockLog(),
        mockConfig,
        mockStatsD,
        stubConstructor
      );
      return pushbox
        .retrieve(mockUid, mockDeviceIds[0], 50, 10)
        .then((result: { last: boolean; index: number; messages: Array<{ index: number; data: Record<string, string> }> }) => {
          expect(result).toEqual({
            last: true,
            index: 15,
            messages: [
              {
                index: 15,
                data: { foo: 'bar', bar: 'bar' },
              },
            ],
          });
        });
    });

    it('retrieve throws on error response', () => {
      stubDbModule.retrieve.rejects(new Error('db is a mess right now'));
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      return pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10).then(
        () => {
          throw new Error('should not happen');
        },
        (err: PushboxError) => {
          expect(err).toBeTruthy();
          expect(err.errno).toBe(error.ERRNO.UNEXPECTED_ERROR);
          sinon.assert.calledOnce(log.error);
          expect(log.error.args[0][0]).toBe('pushbox.db.retrieve');
          expect(log.error.args[0][1]['error']['message']).toBe(
            'db is a mess right now'
          );
        }
      );
    });

    it('deletes records of a device', () => {
      stubDbModule.deleteDevice.resolves();
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      return pushbox.deleteDevice(mockUid, mockDeviceIds[0]).then(
        (res: undefined) => {
          expect(res).toBeUndefined();
          expect(mockStatsD.timing.args[0][0]).toBe(
            'pushbox.db.delete.device.success'
          );
          sinon.assert.calledOnceWithExactly(
            mockStatsD.increment,
            'pushbox.db.delete.device'
          );
        },
        (err: Error) => {
          throw new Error(err.message);
        }
      );
    });

    it('throws error when delete device fails', () => {
      stubDbModule.deleteDevice.rejects(new Error('db is a mess right now'));
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      return pushbox.deleteDevice(mockUid, mockDeviceIds[0]).then(
        () => {
          throw new Error('should not happen');
        },
        (err: PushboxError) => {
          expect(err).toBeTruthy();
          expect(err.errno).toBe(error.ERRNO.UNEXPECTED_ERROR);
          sinon.assert.calledOnce(log.error);
          expect(log.error.args[0][0]).toBe('pushbox.db.delete.device');
          expect(log.error.args[0][1]['error']['message']).toBe(
            'db is a mess right now'
          );
        }
      );
    });

    it('deletes all records for an account', () => {
      stubDbModule.deleteAccount.resolves();
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      return pushbox.deleteAccount(mockUid).then(
        (res: undefined) => {
          expect(res).toBeUndefined();
          expect(mockStatsD.timing.args[0][0]).toBe(
            'pushbox.db.delete.account.success'
          );
          sinon.assert.calledOnceWithExactly(
            mockStatsD.increment,
            'pushbox.db.delete.account'
          );
        },
        (err: Error) => {
          throw new Error(err.message);
        }
      );
    });

    it('throws error when delete account fails', () => {
      stubDbModule.deleteAccount.rejects(
        new Error('someone deleted the pushboxv1 table')
      );
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      return pushbox.deleteAccount(mockUid).then(
        () => {
          throw new Error('should not happen');
        },
        (err: PushboxError) => {
          expect(err).toBeTruthy();
          expect(err.errno).toBe(error.ERRNO.UNEXPECTED_ERROR);
          sinon.assert.calledOnce(log.error);
          expect(log.error.args[0][0]).toBe('pushbox.db.delete.account');
          expect(log.error.args[0][1]['error']['message']).toBe(
            'someone deleted the pushboxv1 table'
          );
        }
      );
    });
  });

  it('feature disabled', () => {
    const config = Object.assign({}, mockConfig, {
      pushbox: { enabled: false },
    });
    const pushbox = pushboxApi(mockLog(), config);
    return pushbox
      .store(mockUid, mockDeviceIds[0], 'sendtab', mockData)
      .then(
        () => {
          throw new Error('should not happen');
        },
        (err: Error) => {
          expect(err).toBeTruthy();
          expect(err.message).toBe('Feature not enabled');
        }
      )
      .then(() => pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10))
      .then(
        () => {
          throw new Error('should not happen');
        },
        (err: Error) => {
          expect(err).toBeTruthy();
          expect(err.message).toBe('Feature not enabled');
        }
      );
  });
});
