/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');
const base64url = require('base64url');
const webpush = require('web-push');

const PUSH_PAYLOAD_SCHEMA_VERSION = 1;
const PUSH_COMMANDS = {
  DEVICE_CONNECTED: 'fxaccounts:device_connected',
  DEVICE_DISCONNECTED: 'fxaccounts:device_disconnected',
  PROFILE_UPDATED: 'fxaccounts:profile_updated',
  PASSWORD_CHANGED: 'fxaccounts:password_changed',
  PASSWORD_RESET: 'fxaccounts:password_reset',
  ACCOUNT_DESTROYED: 'fxaccounts:account_destroyed',
  COMMAND_RECEIVED: 'fxaccounts:command_received',
};

const PUSH_REASONS = new Set([
  'accountVerify',
  'accountConfirm',
  'passwordReset',
  'passwordChange',
  'deviceConnected',
  'deviceDisconnected',
  'profileUpdated',
  'devicesNotify',
  'accountDestroyed',
  'commandReceived',
]);

const PUSH_ERRORS = new Set([
  'noCallback',
  'noKeys',
  'expiredCallback',
  'resetCallback',
  'serverError',
  'unknown',
]);

const PUSH_ERROR_MESSAGES = {
  noCallback: 'No push callback',
  noKeys: 'Data payload preset but missing keys',
  expiredCallback: 'Push callback expired',
  resetCallback: 'Push callback indicated it should be reset',
  unknown: 'Unknown push error',
};

const ERR_NO_PUSH_CALLBACK = 'noCallback';
const ERR_DATA_BUT_NO_KEYS = 'noKeys';
const ERR_PUSH_CALLBACK_EXPIRED = 'expiredCallback';
const ERR_PUSH_CALLBACK_RESET = 'resetCallback';
const ERR_PUSH_UNKNOWN = 'unknown';

const LOG_OP_PUSH_SEND_ATTEMPT = 'push.send.attempt';
const LOG_OP_PUSH_SEND_FAILURE = 'push.send.failure';
const LOG_OP_PUSH_SEND_SUCCESS = 'push.send.success';
const LOG_OP_PUSH_UNEXPECTED_ERROR = 'push.sendPush.unexpectedError';
const LOG_OP_TOO_MANY_DEVICES = 'push.sendPush.tooManyDevices';
const LOG_OP_DEVICE_UPDATE_FAILED = 'push.sendPush.deviceUpdateFailed';

const TTL_DEVICE_DISCONNECTED = 5 * 3600; // 5 hours
const TTL_PASSWORD_CHANGED = 6 * 3600; // 6 hours
const TTL_PASSWORD_RESET = TTL_PASSWORD_CHANGED;
const TTL_ACCOUNT_DESTROYED = TTL_DEVICE_DISCONNECTED;
const TTL_COMMAND_RECEIVED = TTL_PASSWORD_CHANGED;

// An arbitrary, but very generous, limit on the number of active devices.
// Currently only for metrics purposes, not enforced.
const MAX_ACTIVE_DEVICES = 200;

/**
 * A device object returned by the db,
 * typically obtained by calling db.devices(uid).
 * @typedef {Object} Device
 */

module.exports = function (log, db, config, statsd) {
  let vapid;
  if (config.vapidKeysFile) {
    const vapidKeys = require(config.vapidKeysFile);
    vapid = {
      privateKey: vapidKeys.privateKey,
      publicKey: vapidKeys.publicKey,
      subject: config.publicUrl,
    };
  }

  /**
   * iOS clients don't yet support all commands types, and due to
   * platform limitations they have to show some bad fallback UX
   * if they receive an unsupported message type.  Filter out
   * devices that we know won't respond well to the given command.
   *
   * @param {String} command
   */
  function canSendToIOS(command) {
    switch (command) {
      case 'fxaccounts:command_received':
      case 'fxaccounts:device_connected':
      case 'fxaccounts:device_disconnected':
        return true;
      case 'sync:collection_changed': // Used by legacy Send Tab unsupported on iOS.
      case null: // In the null case this is an account verification push message but iOS uses the OAuth flow nowadays.
        return false;
      default:
        return false;
    }
  }

  /**
   * Some clients don't support all Push messages, filter them out.
   *
   * @param {Object} payload
   * The push message payload
   * @param {Device[]} devices
   * The list of devices to which to send the push.
   */
  function filterSupportedDevices(payload, devices) {
    const command = (payload && payload.command) || null;
    return devices.filter((device) => {
      const deviceOS = device.uaOS && device.uaOS.toLowerCase();
      if (deviceOS === 'ios' && !canSendToIOS(command)) {
        log.info('push.filteredUnsupportedDevice', {
          command: command,
          uaOS: device.uaOS,
        });
        return false;
      }
      return true;
    });
  }

  /**
   * Checks whether the given string is a valid public key for push.
   * This is a little tricky because we need to work around a bug in nodejs
   * where using an invalid ECDH key can cause a later (unrelated) attempt
   * to generate an RSA signature to fail:
   *
   *   https://github.com/nodejs/node/pull/13275
   *
   * @param key
   * The public key as a b64url string.
   */

  const dummySigner = crypto.createSign('RSA-SHA256');
  const dummyKey = Buffer.alloc(0);
  const dummyCurve = crypto.createECDH('prime256v1');
  dummyCurve.generateKeys();

  function isValidPublicKey(publicKey) {
    // Try to use the key in an ECDH agreement.
    // If the key is invalid then this will throw an error.
    try {
      dummyCurve.computeSecret(base64url.toBuffer(publicKey));
      return true;
    } catch (err) {
      log.info('push.isValidPublicKey', {
        name: 'Bad public key detected',
      });
      // However!  The above call might have left some junk
      // sitting around on the openssl error stack.
      // Clear it by deliberately triggering a signing error
      // before anything yields the event loop.
      try {
        dummySigner.sign(dummyKey);
      } catch (e) {}
      return false;
    }
  }

  return {
    isValidPublicKey,

    /**
     * Notify devices that a new command is ready to be retrieved.
     *
     * @param {String} uid
     * @param {Device} device
     * @param {Number} index - index of the newly-enqueued command
     * @param {String} url - url to retrieve the command details.
     * @param {String} topic
     * @param {String} reason
     * @promise
     */
    notifyCommandReceived(uid, device, command, sender, index, url, ttl) {
      if (typeof ttl === 'undefined') {
        ttl = TTL_COMMAND_RECEIVED;
      }
      const options = {
        data: {
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.COMMAND_RECEIVED,
          data: {
            command,
            index,
            sender,
            url,
          },
        },
        TTL: ttl,
      };
      return this.sendPush(uid, [device], 'commandReceived', options);
    },

    /**
     * Notify devices that a new device was connected
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @param {String} deviceName
     * @promise
     */
    notifyDeviceConnected(uid, devices, deviceName) {
      return this.sendPush(uid, devices, 'deviceConnected', {
        data: {
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.DEVICE_CONNECTED,
          data: {
            deviceName,
          },
        },
      });
    },

    /**
     * Notify devices that a device was disconnected from the account
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @param {String} idToDisconnect
     * @promise
     */
    notifyDeviceDisconnected(uid, devices, idToDisconnect) {
      return this.sendPush(uid, devices, 'deviceDisconnected', {
        data: {
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.DEVICE_DISCONNECTED,
          data: {
            id: idToDisconnect,
          },
        },
        TTL: TTL_DEVICE_DISCONNECTED,
      });
    },

    /**
     * Notify devices that the profile attached to the account was updated
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @promise
     */
    notifyProfileUpdated(uid, devices) {
      return this.sendPush(uid, devices, 'profileUpdated', {
        data: {
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.PROFILE_UPDATED,
        },
      });
    },

    /**
     * Notify devices that the password was changed
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @promise
     */
    notifyPasswordChanged(uid, devices) {
      return this.sendPush(uid, devices, 'passwordChange', {
        data: {
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.PASSWORD_CHANGED,
        },
        TTL: TTL_PASSWORD_CHANGED,
      });
    },

    /**
     * Notify devices that the password was reset
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @promise
     */
    notifyPasswordReset(uid, devices) {
      return this.sendPush(uid, devices, 'passwordReset', {
        data: {
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.PASSWORD_RESET,
        },
        TTL: TTL_PASSWORD_RESET,
      });
    },

    /**
     * Notify devices that there was an update to the account
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @param {String} reason
     * @promise
     */
    notifyAccountUpdated(uid, devices, reason) {
      return this.sendPush(uid, devices, reason);
    },

    /**
     * Notify devices that the account no longer exists
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @promise
     */
    notifyAccountDestroyed(uid, devices) {
      return this.sendPush(uid, devices, 'accountDestroyed', {
        data: {
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.ACCOUNT_DESTROYED,
          data: {
            uid,
          },
        },
        TTL: TTL_ACCOUNT_DESTROYED,
      });
    },

    /**
     * Send a push notification with or without data to a list of devices
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @param {String} reason
     * @param {Object} [options]
     * @param {Object} [options.data]
     * @param {Number} [options.TTL] (in seconds)
     * @promise
     */
    async sendPush(uid, devices, reason, options = {}) {
      devices = filterSupportedDevices(options.data, devices);
      if (!PUSH_REASONS.has(reason)) {
        throw `Unknown push reason: ${reason}`;
      }
      // There's no spec-compliant way to error out as a result of having
      // too many devices to notify.  For now, just log metrics about it.
      if (devices.length > MAX_ACTIVE_DEVICES) {
        log.warn(LOG_OP_TOO_MANY_DEVICES, { uid });
      }
      for (const device of devices) {
        const deviceId = device.id;

        // Details that we might want to include in logs.
        const metricsTags = {
          reason,
          uid,
          deviceId,
          uaOS: device.uaOS,
          uaOSVersion: device.uaOSVersion,
          uaBrowser: device.uaBrowser,
          uaBrowserVersion: device.uaBrowserVersion,
        };
        this.reportPushAttempt(device.pushCallback, metricsTags);

        if (!device.pushCallback) {
          this.reportPushFailure(ERR_NO_PUSH_CALLBACK, metricsTags);
          continue;
        }
        if (device.pushEndpointExpired) {
          this.reportPushFailure(ERR_PUSH_CALLBACK_EXPIRED, metricsTags);
          continue;
        }
        const pushSubscription = { endpoint: device.pushCallback };
        let pushPayload = null;
        const pushOptions = { TTL: options.TTL || '0' };
        if (options.data) {
          if (!device.pushPublicKey || !device.pushAuthKey) {
            this.reportPushFailure(ERR_DATA_BUT_NO_KEYS, metricsTags);
            continue;
          }
          pushSubscription.keys = {
            p256dh: device.pushPublicKey,
            auth: device.pushAuthKey,
          };
          pushPayload = Buffer.from(JSON.stringify(options.data));
        }
        if (vapid) {
          pushOptions.vapidDetails = vapid;
        }
        try {
          await webpush.sendNotification(
            pushSubscription,
            pushPayload,
            pushOptions
          );
          this.reportPushSuccess(metricsTags);
        } catch (err) {
          // If we've stored an invalid key in the db for some reason, then we
          // might get an encryption failure here.  Check the key, which also
          // happens to work around bugginess in node's handling of said failures.
          let keyWasInvalid = false;
          if (!err.statusCode && device.pushPublicKey) {
            if (!isValidPublicKey(device.pushPublicKey)) {
              keyWasInvalid = true;
            }
          }
          // 404 or 410 error from the push servers means
          // the push settings need to be reset.
          // the clients will check this and re-register push endpoints
          if (
            err.statusCode === 404 ||
            err.statusCode === 410 ||
            keyWasInvalid
          ) {
            this.reportPushFailure(ERR_PUSH_CALLBACK_RESET, metricsTags);
            // set the push endpoint expired flag
            // Warning: this method is called without any session tokens or auth validation.
            device.pushEndpointExpired = true;
            try {
              await db.updateDevice(uid, device);
            } catch (err) {
              log.warn(LOG_OP_DEVICE_UPDATE_FAILED, { uid, deviceId, err });
            }
          } else {
            log.error(LOG_OP_PUSH_UNEXPECTED_ERROR, { err });
            this.reportPushFailure(err, metricsTags);
          }
        }
      }
    },

    reportPushAttempt(pushCallback, metricsTags) {
      this.incrementPushMetric(LOG_OP_PUSH_SEND_ATTEMPT, metricsTags);
      log.info(LOG_OP_PUSH_SEND_ATTEMPT, metricsTags);
      // Log the full callback URL for debugging purposes.
      log.trace(LOG_OP_PUSH_SEND_ATTEMPT, {
        pushCallback,
        ...metricsTags,
      });
    },

    reportPushFailure(err, metricsTags) {
      let errCode;
      if (PUSH_ERRORS.has(err)) {
        errCode = err;
        err = new Error(PUSH_ERROR_MESSAGES[errCode]);
      } else {
        errCode = ERR_PUSH_UNKNOWN;
      }
      metricsTags = { errCode, err, ...metricsTags };
      this.incrementPushMetric(LOG_OP_PUSH_SEND_FAILURE, metricsTags);
      log.warn(LOG_OP_PUSH_SEND_FAILURE, metricsTags);
    },

    reportPushSuccess(metricsTags) {
      this.incrementPushMetric(LOG_OP_PUSH_SEND_SUCCESS, metricsTags);
      log.info(LOG_OP_PUSH_SEND_SUCCESS, metricsTags);
    },

    incrementPushMetric(name, tags) {
      // StatsD can't cope with high-cardinality tags, filter them out.
      statsd.increment(name, {
        reason: tags.reason,
        uaOS: tags.uaOS,
        errCode: tags.errCode,
      });
    },
  };
};
