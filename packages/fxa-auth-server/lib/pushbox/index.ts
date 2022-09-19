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
import * as isA from 'joi';
import { performance } from 'perf_hooks';

import { ConfigType } from '../../config';
import createBackendServiceAPI from '../backendService';
import error from '../error';
import validators from '../routes/validators';
import { PushboxDB } from './db';

const PUSHBOX_RETRIEVE_SCHEMA = isA
  .object({
    last: isA.boolean().optional(),
    index: isA.number().optional(),
    messages: isA
      .array()
      .items(
        isA.object({
          index: isA.number().required(),
          data: isA.string().regex(validators.URL_SAFE_BASE_64).required(),
        })
      )
      .optional(),
    status: isA.number().required(),
    error: isA.string().optional(),
  })
  .and('last', 'messages')
  .or('index', 'error');

const PUSHBOX_STORE_SCHEMA = isA
  .object({
    index: isA.number().optional(),
    error: isA.string().optional(),
    status: isA.number().required(),
  })
  .or('index', 'error');

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
    };
  }

  const useDirectDbAccess = config.pushbox.directDbAccessUidDigits.length > 0;
  const pushboxDb = useDirectDbAccess
    ? new DB({
        config: config.pushbox.database,
        log,
        statsd,
      })
    : null;
  const shouldUseDb = useDirectDbAccess
    ? (uid: string) =>
        (config.pushbox.directDbAccessUidDigits as string[]).includes(uid[0])
    : () => false;

  const PushboxAPI = createBackendServiceAPI(
    log,
    config,
    'pushbox',
    {
      retrieve: {
        path: '/v1/store/:uid/:deviceId',
        method: 'GET',
        validate: {
          params: {
            uid: isA.string().regex(validators.HEX_STRING).required(),
            deviceId: isA.string().regex(validators.HEX_STRING).required(),
          },
          query: {
            limit: isA.string().regex(validators.DIGITS).required(),
            index: isA.string().regex(validators.DIGITS).optional(),
          },
          response: PUSHBOX_RETRIEVE_SCHEMA,
        },
      },

      store: {
        path: '/v1/store/:uid/:deviceId',
        method: 'POST',
        validate: {
          params: {
            uid: isA.string().regex(validators.HEX_STRING).required(),
            deviceId: isA.string().regex(validators.HEX_STRING).required(),
          },
          payload: {
            data: isA.string().required(),
            ttl: isA.number().required(),
          },
          response: PUSHBOX_STORE_SCHEMA,
        },
      },
    },
    statsd
  );

  const api = new PushboxAPI(config.pushbox.url, {
    headers: { Authorization: `FxA-Server-Key ${config.pushbox.key}` },
    timeout: 15000,
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

      // It's possible that the user has records in the old DB so we need to
      // query new DB (if config'd) and the Pushbox service.  In the message
      // pushed to the device, notifying it of a new device command, a url to
      // fetch the command payload is included.  An index and a limit of 1 are
      // in that url.  When there is a limit of 1, we can safely return the
      // found record from either DB.
      //
      // Clients have the option to poll for commands, with potentially
      // paginated results.  We need to handle that.

      // @ts-ignore createBackendServiceAPI is pretty dynamic, and we'll be
      // removing this since we want to move over to direct db calls
      const body = await api.retrieve(uid, deviceId, query);
      log.debug('pushbox.retrieve.response', { body: body });
      if (body.error) {
        log.error('pushbox.retrieve', {
          status: body.status,
          error: body.error,
        });
        throw error.backendServiceFailure();
      }
      const pushboxServiceResult = {
        last: body.last,
        index: body.index,
        messages: !body.messages
          ? undefined
          : body.messages.map((msg: Record<string, unknown>) => {
              return {
                index: msg.index,
                data: decodeFromStorage(msg.data as string),
              };
            }),
      };

      // the old DB instance have lower index values, so we return a record
      // from there if found

      if (limit === 1 && pushboxServiceResult.messages?.length > 0) {
        return pushboxServiceResult;
      }

      let directDbResult = null;

      if (shouldUseDb(uid)) {
        const startTime = performance.now();
        try {
          const result = await pushboxDb!.retrieve({
            uid,
            deviceId,
            limit,
            index,
          });
          statsd.timing(
            'pushbox.db.retrieve.success',
            performance.now() - startTime
          );
          statsd.increment('pushbox.db.retrieve', {
            uid,
            deviceId,
            msgCount: result.messages.length.toString(),
          });
          directDbResult = {
            last: result.last,
            index: result.index,
            messages: result.messages.map((msg) => ({
              index: msg.idx,
              data: decodeFromStorage(msg.data as string),
            })),
          };
          if (limit === 1) {
            return directDbResult;
          }
        } catch (err) {
          statsd.timing(
            'pushbox.db.retrieve.failure',
            performance.now() - startTime
          );
          log.error('pushbox.db.retrieve', { error: err });
          throw error.unexpectedError();
        }
      }

      // the client is polling for commands

      const getAdditionalCommands = async (x: {
        uid: string;
        deviceId: string;
        limit: number;
        index: number;
      }) => {
        try {
          return pushboxDb!.retrieve(x);
        } catch (err) {
          // we can return some results even if this additional check errors, so we won't be rethrowing here
          log.error('pushbox.db.retrieve.additional_commands', {
            error: err,
          });
        }
        return null;
      };

      // the simplest case is a $limit number of records have been found in the old db.
      if (pushboxServiceResult?.messages?.length === limit) {
        // however, if the pushbox service indicates that this is the last
        // page, we should check whether that there are additional, newer
        // commands, in the new DB.
        if (pushboxServiceResult.last && shouldUseDb(uid)) {
          const additionalCommands = await getAdditionalCommands({
            uid,
            deviceId,
            limit: 1,
            index: 0,
          });
          if (additionalCommands && additionalCommands.messages.length > 0) {
            pushboxServiceResult.last = false;
          }
        }

        return pushboxServiceResult;
      }

      // or we might need to combine up to $limit commands from old and new db.

      if (pushboxServiceResult?.messages?.length < limit && shouldUseDb(uid)) {
        const additionalCommands = await getAdditionalCommands({
          uid,
          deviceId,
          index: 0,
          limit: limit - pushboxServiceResult.messages.length,
        });

        if (additionalCommands && additionalCommands.messages.length > 0) {
          return {
            last: additionalCommands.last,
            index: additionalCommands.index,
            messages: [
              ...pushboxServiceResult.messages,
              ...additionalCommands.messages.map((msg) => ({
                index: msg.idx,
                data: decodeFromStorage(msg.data as string),
              })),
            ],
          };
        }

        return pushboxServiceResult;
      }

      // or nothing found in the old DB but there are commands in the new db.

      if (directDbResult && directDbResult?.messages.length > 0) {
        return directDbResult;
      }

      // default
      // nothing found or user data is entirely in old db
      return pushboxServiceResult;
    },

    /**
     * Enqueue an item for a specific device.
     * This inserts into the pushbox database or relays the request to the
     * Pushbox service, encoding rich objects down into a string for storage.
     *
     * @param {String} uid - Firefox Account uid
     * @param {String} deviceId
     * @param {string} topic
     * @param {Object} data - data object to serialize into storage
     * @returns {Promise} object with `index` to the inserted record
     */
    async store(uid: string, deviceId: string, data: any, ttl: number) {
      if (typeof ttl === 'undefined' || ttl > maxTTL) {
        ttl = maxTTL;
      }

      if (shouldUseDb(uid)) {
        const startTime = performance.now();
        try {
          const result = await pushboxDb!.store({
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
          statsd.increment('pushbox.db.store', { uid, deviceId });
          return { index: result.idx };
        } catch (err) {
          statsd.timing(
            'pushbox.db.store.failure',
            performance.now() - startTime
          );
          log.error('pushbox.db.store', { error: err });
          throw error.unexpectedError();
        }
      }

      // @ts-ignore createBackendServiceAPI is pretty dynamic, and we'll be
      // removing this since we want to move over to direct db calls
      const body = await api.store(uid, deviceId, {
        data: encodeForStorage(data),
        ttl,
      });
      log.info('pushbox.store.response', { body: body });
      if (body.error) {
        log.error('pushbox.store', { status: body.status, error: body.error });
        throw error.backendServiceFailure();
      }
      return body;
    },
  };
};

export default pushboxApi;
export const RETRIEVE_SCHEMA = PUSHBOX_RETRIEVE_SCHEMA;
