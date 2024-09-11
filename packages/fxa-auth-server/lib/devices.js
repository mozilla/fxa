/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import isA from 'joi';
import Sentry from '@sentry/node';
import { default as DESCRIPTION } from '../docs/swagger/shared/descriptions';
import * as validators from './routes/validators';
import error from './error';
import oauthDB from './oauth/db';
import config from '../config';
import { synthesizeClientName } from 'fxa-shared/connected-services';

const PUSH_SERVER_REGEX = config.get('push.allowedServerRegex');
const SCHEMA = {
  id: isA.string().length(32).regex(validators.HEX_STRING),
  location: isA
    .object({
      city: isA.string().optional().allow(null),
      country: isA.string().optional().allow(null),
      state: isA.string().optional().allow(null),
      stateCode: isA.string().optional().allow(null),
    })
    .description(DESCRIPTION.location),
  name: isA
    .string()
    .max(255)
    .regex(validators.DISPLAY_SAFE_UNICODE_WITH_NON_BMP),
  // We previously allowed devices to register with arbitrary unicode names,
  // so we can't assert DISPLAY_SAFE_UNICODE_WITH_NON_BMP in the response schema.
  nameResponse: isA.string().max(255).allow(''),
  type: isA.string().max(16),
  pushCallback: validators
    .pushCallbackUrl({ scheme: 'https' })
    .regex(PUSH_SERVER_REGEX)
    .max(255)
    .allow(''),
  pushPublicKey: isA
    .string()
    .max(88)
    .regex(validators.URL_SAFE_BASE_64)
    .allow(''),
  pushAuthKey: isA
    .string()
    .max(24)
    .regex(validators.URL_SAFE_BASE_64)
    .allow(''),
  pushEndpointExpired: isA.boolean().strict(),
  // An object mapping command names to metadata bundles.
  availableCommands: isA
    .object()
    .pattern(validators.DEVICE_COMMAND_NAME, isA.string().max(2048)),
};

export default (log, db, push, pushbox) => {
  return { isSpuriousUpdate, upsert, destroy, synthesizeName };

  // Clients have been known to send spurious device updates,
  // which generates lots of unnecessary database load.
  // Check if anything has actually changed.
  function isSpuriousUpdate(payload, token) {
    if (!token.deviceId || payload.id !== token.deviceId) {
      return false;
    }

    if (payload.name && payload.name !== token.deviceName) {
      return false;
    }

    if (payload.type && payload.type !== token.deviceType) {
      return false;
    }

    if (
      payload.pushCallback &&
      payload.pushCallback !== token.deviceCallbackURL
    ) {
      return false;
    }

    if (
      payload.pushPublicKey &&
      payload.pushPublicKey !== token.deviceCallbackPublicKey
    ) {
      return false;
    }

    if (payload.availableCommands) {
      if (!token.deviceAvailableCommands) {
        return false;
      }

      if (!isLike(token.deviceAvailableCommands, payload.availableCommands)) {
        return false;
      }

      if (!isLike(payload.availableCommands, token.deviceAvailableCommands)) {
        return false;
      }
    }

    return true;
  }

  async function upsert(request, credentials, deviceInfo) {
    let operation, event;
    if (deviceInfo.id) {
      operation = 'updateDevice';
      event = 'device.updated';
    } else {
      operation = 'createDevice';
      event = 'device.created';
      // Set a default name from the OAuth client name, if available.
      // It would be better to do this on read rather than on write, so that any changes to
      // OAuth client names get reflected automatically in the device list, but doing that reliably
      // is a little awkward right now.
      if (!deviceInfo.name) {
        deviceInfo.name = (credentials.client && credentials.client.name) || '';
      }
    }

    deviceInfo.sessionTokenId = credentials.id;
    deviceInfo.refreshTokenId = credentials.refreshTokenId;

    const isPlaceholderDevice =
      !deviceInfo.id && !deviceInfo.name && !deviceInfo.type;

    const result = await db[operation](credentials.uid, deviceInfo);
    await request.emitMetricsEvent(event, {
      uid: credentials.uid,
      device_id: result.id,
      is_placeholder: isPlaceholderDevice,
    });
    if (operation === 'createDevice') {
      // Clients expect this notification to always include a name,
      // so try to synthesize one if necessary.
      let deviceName = result.name;
      if (!deviceName) {
        deviceName =
          (credentials.client && credentials.client.name) ||
          synthesizeName(deviceInfo);
      }
      if (credentials.tokenVerified) {
        // Fire off the notify without waiting.
        (async () => {
          const devices = await db.devices(credentials.uid);
          const otherDevices = devices.filter(
            (device) => device.id !== result.id
          );
          return push.notifyDeviceConnected(
            credentials.uid,
            otherDevices,
            deviceName
          );
        })();
      }

      if (isPlaceholderDevice) {
        log.info('device.createPlaceholder', {
          uid: credentials.uid,
          deviceId: result.id,
        });
      }
      await log.notifyAttachedServices('device:create', request, {
        uid: credentials.uid,
        id: result.id,
        type: result.type,
        timestamp: result.createdAt,
        isPlaceholder: isPlaceholderDevice,
      });
    }

    delete result.sessionTokenId;
    delete result.refreshTokenId;
    return result;
  }

  async function destroy(request, deviceId) {
    // We want to include the disconnected device in the list
    // of devices to notify, so list them before disconnecting.
    const peers = await request.app.devices;

    const uid = request.auth.credentials.uid;
    const deletedDevice = await db.deleteDevice(uid, deviceId);
    if (deletedDevice && deletedDevice.refreshTokenId) {
      try {
        const token = await oauthDB.getRefreshToken(
          deletedDevice.refreshTokenId
        );
        await oauthDB.removeRefreshToken(token);
      } catch (err) {
        // The refresh token might already have been deleted, because distributed state.
        // We don't want errors here to fail the deletion request, because the caller
        // can't retry it (the device record is already gone).
        if (err.errno !== error.ERRNO.INVALID_TOKEN) {
          log.error('deviceDestroy.revokeRefreshTokenById.error', {
            err: err.message,
          });
        }
      }
    }

    // No need to await and block the notifications below.  If the records
    // aren't deleted with this call, they will be once they expire.
    pushbox.deleteDevice(uid, deviceId).catch((err) => {
      Sentry.withScope((scope) => {
        scope.setContext('pushboxDeleteDevice', { uid, deviceId });
        Sentry.captureException(err);
      });
    });

    // Notify peer devices, but dont let failure fail the whole request.
    try {
      await push.notifyDeviceDisconnected(uid, peers, deviceId);
    } catch (err) {}

    await request.emitMetricsEvent('device.deleted', {
      uid: uid,
      device_id: deviceId,
    });
    await log.notifyAttachedServices('device:delete', request, {
      uid: uid,
      id: deviceId,
      timestamp: Date.now(),
    });

    return deletedDevice;
  }

  function synthesizeName(device) {
    return synthesizeClientName(device);
  }
};

export { SCHEMA as schema };

function isLike(object, archetype) {
  return Object.entries(archetype).every(
    ([key, value]) => object[key] === value
  );
}
