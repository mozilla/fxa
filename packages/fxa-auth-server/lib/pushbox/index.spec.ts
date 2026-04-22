/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { pushboxApi } = require('./index');
const { AppError: error } = require('@fxa/accounts/errors');
const { mockLog } = require('../../test/mocks');
let mockStatsD: { increment: jest.Mock; timing: jest.Mock };

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
const mockUid = 'ABCDEF';

interface PushboxError extends Error {
  errno: number;
}

interface RetrieveResult {
  last: boolean;
  index: number;
  messages: Array<{ index: number; data: Record<string, string> }>;
}

describe('pushbox', () => {
  describe('using direct Pushbox database access', () => {
    let stubDbModule: any;
    let stubConstructor: jest.Mock;

    beforeEach(() => {
      mockStatsD = { increment: jest.fn(), timing: jest.fn() };
      // Create a mock instance with the methods we need
      stubDbModule = {
        store: jest.fn(),
        retrieve: jest.fn(),
        deleteDevice: jest.fn(),
        deleteAccount: jest.fn(),
      };
      stubConstructor = jest.fn().mockReturnValue(stubDbModule);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('store', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000534);
      stubDbModule.store.mockResolvedValue({ idx: 12 });
      const pushbox = pushboxApi(
        mockLog(),
        mockConfig,
        mockStatsD,
        stubConstructor
      );
      return pushbox
        .store(mockUid, mockDeviceIds[0], { test: 'data' })
        .then(({ index }: { index: number }) => {
          expect(stubDbModule.store).toHaveBeenCalledTimes(1);
          expect(stubDbModule.store).toHaveBeenCalledWith({
            uid: mockUid,
            deviceId: mockDeviceIds[0],
            data: 'eyJ0ZXN0IjoiZGF0YSJ9',
            ttl: 124457,
          });
          expect(mockStatsD.timing).toHaveBeenCalledTimes(1);
          expect(mockStatsD.timing).toHaveBeenCalledWith(
            'pushbox.db.store.success',
            expect.any(Number)
          );
          expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
          expect(mockStatsD.increment).toHaveBeenCalledWith('pushbox.db.store');
          expect(index).toBe(12);
        });
    });

    it('store with custom ttl', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000534);
      stubDbModule.store.mockResolvedValue({ idx: 12 });
      const pushbox = pushboxApi(
        mockLog(),
        mockConfig,
        mockStatsD,
        stubConstructor
      );
      return pushbox
        .store(mockUid, mockDeviceIds[0], { test: 'data' }, 42)
        .then(({ index }: { index: number }) => {
          expect(stubDbModule.store).toHaveBeenCalledTimes(1);
          expect(stubDbModule.store).toHaveBeenCalledWith({
            uid: mockUid,
            deviceId: mockDeviceIds[0],
            data: 'eyJ0ZXN0IjoiZGF0YSJ9',
            ttl: 1043,
          });
          expect(index).toBe(12);
        });
    });

    it('store caps ttl at configured maximum', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000432);
      stubDbModule.store.mockResolvedValue({ idx: 12 });
      const pushbox = pushboxApi(
        mockLog(),
        mockConfig,
        mockStatsD,
        stubConstructor
      );
      return pushbox
        .store(mockUid, mockDeviceIds[0], { test: 'data' }, 999999999)
        .then(({ index }: { index: number }) => {
          expect(stubDbModule.store).toHaveBeenCalledTimes(1);
          expect(stubDbModule.store).toHaveBeenCalledWith({
            uid: mockUid,
            deviceId: mockDeviceIds[0],
            data: 'eyJ0ZXN0IjoiZGF0YSJ9',
            ttl: 124457,
          });
          expect(index).toBe(12);
        });
    });

    it('logs an error when failed to store', async () => {
      stubDbModule.store.mockRejectedValue(new Error('db is a mess right now'));
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      try {
        await pushbox.store(
          mockUid,
          mockDeviceIds[0],
          { test: 'data' },
          999999999
        );
        throw new Error('should not happen');
      } catch (err) {
        expect(err).toBeTruthy();
        expect((err as PushboxError).errno).toBe(error.ERRNO.UNEXPECTED_ERROR);
        expect(log.error).toHaveBeenCalledTimes(1);
        expect(log.error).toHaveBeenCalledWith(
          'pushbox.db.store',
          expect.objectContaining({
            error: expect.objectContaining({
              message: 'db is a mess right now',
            }),
          })
        );
      }
    });

    it('retrieve', async () => {
      stubDbModule.retrieve.mockResolvedValue({
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
      const result: RetrieveResult = await pushbox.retrieve(
        mockUid,
        mockDeviceIds[0],
        50,
        10
      );
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

    it('retrieve throws on error response', async () => {
      stubDbModule.retrieve.mockRejectedValue(
        new Error('db is a mess right now')
      );
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      try {
        await pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10);
        throw new Error('should not happen');
      } catch (err) {
        expect(err).toBeTruthy();
        expect((err as PushboxError).errno).toBe(error.ERRNO.UNEXPECTED_ERROR);
        expect(log.error).toHaveBeenCalledTimes(1);
        expect(log.error).toHaveBeenCalledWith(
          'pushbox.db.retrieve',
          expect.objectContaining({
            error: expect.objectContaining({
              message: 'db is a mess right now',
            }),
          })
        );
      }
    });

    it('deletes records of a device', async () => {
      stubDbModule.deleteDevice.mockResolvedValue(undefined);
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      const res = await pushbox.deleteDevice(mockUid, mockDeviceIds[0]);
      expect(res).toBeUndefined();
      expect(mockStatsD.timing).toHaveBeenCalledWith(
        'pushbox.db.delete.device.success',
        expect.any(Number)
      );
      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'pushbox.db.delete.device'
      );
    });

    it('throws error when delete device fails', async () => {
      stubDbModule.deleteDevice.mockRejectedValue(
        new Error('db is a mess right now')
      );
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      try {
        await pushbox.deleteDevice(mockUid, mockDeviceIds[0]);
        throw new Error('should not happen');
      } catch (err) {
        expect(err).toBeTruthy();
        expect((err as PushboxError).errno).toBe(error.ERRNO.UNEXPECTED_ERROR);
        expect(log.error).toHaveBeenCalledTimes(1);
        expect(log.error).toHaveBeenCalledWith(
          'pushbox.db.delete.device',
          expect.objectContaining({
            error: expect.objectContaining({
              message: 'db is a mess right now',
            }),
          })
        );
      }
    });

    it('deletes all records for an account', async () => {
      stubDbModule.deleteAccount.mockResolvedValue(undefined);
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      const res = await pushbox.deleteAccount(mockUid);
      expect(res).toBeUndefined();
      expect(mockStatsD.timing).toHaveBeenCalledWith(
        'pushbox.db.delete.account.success',
        expect.any(Number)
      );
      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'pushbox.db.delete.account'
      );
    });

    it('throws error when delete account fails', async () => {
      stubDbModule.deleteAccount.mockRejectedValue(
        new Error('someone deleted the pushboxv1 table')
      );
      const log = mockLog();
      const pushbox = pushboxApi(log, mockConfig, mockStatsD, stubConstructor);
      try {
        await pushbox.deleteAccount(mockUid);
        throw new Error('should not happen');
      } catch (err) {
        expect(err).toBeTruthy();
        expect((err as PushboxError).errno).toBe(error.ERRNO.UNEXPECTED_ERROR);
        expect(log.error).toHaveBeenCalledTimes(1);
        expect(log.error).toHaveBeenCalledWith(
          'pushbox.db.delete.account',
          expect.objectContaining({
            error: expect.objectContaining({
              message: 'someone deleted the pushboxv1 table',
            }),
          })
        );
      }
    });
  });

  it('feature disabled', async () => {
    const config = { ...mockConfig, pushbox: { enabled: false } };
    const pushbox = pushboxApi(mockLog(), config);

    try {
      await pushbox.store(mockUid, mockDeviceIds[0], 'sendtab', mockUid);
      throw new Error('should not happen');
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as Error).message).toBe('Feature not enabled');
    }

    try {
      await pushbox.retrieve(mockUid, mockDeviceIds[0], 50, 10);
      throw new Error('should not happen');
    } catch (err) {
      expect(err).toBeTruthy();
      expect((err as Error).message).toBe('Feature not enabled');
    }
  });
});
