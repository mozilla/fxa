/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * "Pushbox" is a durable queue service that allows customers to store and
 * retrieve large payloads (~1 MB) that persist for generous lengths of time
 * (~1 month).  We use it to provide a "command queue" for each connected device
 * that is more reliable than its webpush subscription.
 *
 * This library implements a little proxy in front of the pushbox API,
 * allowing it to be authenticated by the device's session token.
 * It's likely that we'll eventually refacor this out into a standalone
 * oauth-authenticated service, once we get more experience with using it.
 */

import base64url from 'base64url';
import { ILogger } from 'fxa-shared/log';
import { StatsD } from 'hot-shots';
import { performance } from 'perf_hooks';

import { ConfigType } from '../../config';
import error from '../error';
import { PushboxDB } from './db';

// Pushbox stores strings, so these are a little pair
// of helper functions to allow us to store arbitrary
// JSON-serializable objects.

function encodeForStorage(data: any) {
  return base64url.encode(JSON.stringify(data));
}

function decodeFromStorage(data: string) {
  return JSON.parse(base64url.decode(data));
}

export const pushboxApi = (
  log: ILogger,
  config: ConfigType,
  statsd: StatsD,
  DB = PushboxDB
) => {
  if (!config.pushbox.enabled) {
    return {
      retrieve() {
        return Promise.reject(error.featureNotEnabled());
      },
      store() {
        return Promise.reject(error.featureNotEnabled());
      },
      deleteDevice() {
        return Promise.reject(error.featureNotEnabled());
      },
      deleteAccount() {
        return Promise.reject(error.featureNotEnabled());
      },
    };
  }

  const pushboxDb = new DB({
    config: config.pushbox.database,
    log,
    statsd,
  });

  // pushbox expects this in seconds, not millis.
  const maxTTL = Math.round(
    (config.pushbox.maxTTL as unknown as number) / 1000
  );

  return {
    /**
     * Retrieves enqueued items for a specific device.
     * This simply relays the request to the pushbox service,
     * decoding stored strings back into rich objects.
     */
    async retrieve(
      uid: string,
      deviceId: string,
      limit: number,
      index?: number | null
    ) {
      const query: Record<string, string> = {
        limit: limit.toString(),
      };
      if (index) {
        query.index = index.toString();
      }

      const startTime = performance.now();
      try {
        if (!pushboxDb) throw new Error('pushboxDb is not available');
        const result = await pushboxDb.retrieve({
          uid,
          deviceId,
          limit,
          index,
        });
        statsd.timing(
          'pushbox.db.retrieve.success',
          performance.now() - startTime
        );
        statsd.increment('pushbox.db.retrieve');
        return {
          last: result.last,
          index: result.index,
          messages: result.messages.map((msg) => ({
            index: msg.idx,
            data: decodeFromStorage(msg.data as string),
          })),
        };
      } catch (err) {
        statsd.timing(
          'pushbox.db.retrieve.failure',
          performance.now() - startTime
        );
        log.error('pushbox.db.retrieve', { error: err });
        throw error.unexpectedError();
      }
    },

    /**
     * Enqueue an item for a specific device.
     * This inserts into the pushbox database or relays the request to the
     * Pushbox service, encoding rich objects down into a string for storage.
     *
     * @param {String} uid - Mozilla account uid
     * @param {String} deviceId
     * @param {string} topic
     * @param {Object} data - data object to serialize into storage
     * @returns {Promise} object with `index` to the inserted record
     */
    async store(uid: string, deviceId: string, data: any, ttl: number) {
      if (typeof ttl === 'undefined' || ttl > maxTTL) {
        ttl = maxTTL;
      }

      const startTime = performance.now();
      try {
        if (!pushboxDb) throw new Error('pushboxDb is not available');
        const result = await pushboxDb.store({
          uid,
          deviceId,
          data: encodeForStorage(data),
          // ttl is in seconds
          ttl: Math.ceil(Date.now() / 1000) + ttl,
        });
        statsd.timing(
          'pushbox.db.store.success',
          performance.now() - startTime
        );
        statsd.increment('pushbox.db.store');
        return { index: result.idx };
      } catch (err) {
        statsd.timing(
          'pushbox.db.store.failure',
          performance.now() - startTime
        );
        log.error('pushbox.db.store', { error: err });
        throw error.unexpectedError();
      }
    },

    async deleteDevice(uid: string, deviceId: string) {
      const startTime = performance.now();
      try {
        if (!pushboxDb)
          throw new Error(
            'directDbAccessPercentage is disabled and pushboxDb is not available'
          );
        await pushboxDb.deleteDevice({ uid, deviceId });
        statsd.timing(
          'pushbox.db.delete.device.success',
          performance.now() - startTime
        );
        statsd.increment('pushbox.db.delete.device');
      } catch (err) {
        statsd.timing(
          'pushbox.db.delete.device.failure',
          performance.now() - startTime
        );
        log.error('pushbox.db.delete.device', { error: err });
        throw error.unexpectedError();
      }
    },

    async deleteAccount(uid: string) {
      const startTime = performance.now();
      try {
        if (!pushboxDb)
          throw new Error(
            'directDbAccessPercentage is disabled and pushboxDb is not available'
          );
        await pushboxDb.deleteAccount(uid);
        statsd.timing(
          'pushbox.db.delete.account.success',
          performance.now() - startTime
        );
        statsd.increment('pushbox.db.delete.account');
      } catch (err) {
        statsd.timing(
          'pushbox.db.delete.account.failure',
          performance.now() - startTime
        );
        log.error('pushbox.db.delete.account', { error: err });
        throw error.unexpectedError();
      }
    },
  };
};

export default pushboxApi;
