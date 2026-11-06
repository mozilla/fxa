/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Firestore } from '@google-cloud/firestore';
import { ILogger } from '../../log';
import { PaymentConfigManager } from './manager';

class TestPaymentConfigManager extends PaymentConfigManager {}

const config = {
  authFirestore: { prefix: 'test-' },
  subscriptions: {
    productConfigsFirestore: {
      enabled: true,
      schemaValidation: { cdnUrlRegex: [] },
    },
  },
};

describe('PaymentConfigManager', () => {
  const loadError = new Error('firestore unavailable');
  let log: jest.Mocked<ILogger>;
  let firestore: Firestore;
  let get: jest.Mock;

  beforeEach(() => {
    log = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
    get = jest.fn().mockRejectedValue(loadError);
    firestore = {
      collection: jest.fn().mockReturnValue({
        get,
        onSnapshot: jest.fn().mockReturnValue(jest.fn()),
      }),
    } as unknown as Firestore;
  });

  it('logs a failed constructor load instead of leaving an unhandled rejection', async () => {
    const onUnhandled = jest.fn();
    process.on('unhandledRejection', onUnhandled);
    try {
      new TestPaymentConfigManager(config, firestore, log);
      await new Promise((resolve) => setImmediate(resolve));

      expect(log.error).toHaveBeenCalledWith('paymentConfigManager.load', {
        err: loadError,
      });
      expect(onUnhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });

  it('loads again on the next call after a failed constructor load', async () => {
    const manager = new TestPaymentConfigManager(config, firestore, log);
    await new Promise((resolve) => setImmediate(resolve));
    const load = jest.spyOn(manager, 'load');
    get.mockResolvedValue({ docs: [] });

    expect(await manager.allProducts()).toEqual([]);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
