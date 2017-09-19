/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var crypto = require('crypto')
var base64url = require('base64url')
var webpush = require('web-push')
var P = require('./promise')

var ERR_NO_PUSH_CALLBACK = 'No Push Callback'
var ERR_DATA_BUT_NO_KEYS = 'Data payload present but missing key(s)'
var ERR_TOO_MANY_DEVICES = 'Too many devices connected to account'

var LOG_OP_PUSH_TO_DEVICES = 'push.sendPush'

var PUSH_PAYLOAD_SCHEMA_VERSION = 1
var PUSH_COMMANDS = {
  DEVICE_CONNECTED: 'fxaccounts:device_connected',
  DEVICE_DISCONNECTED: 'fxaccounts:device_disconnected',
  PROFILE_UPDATED: 'fxaccounts:profile_updated',
  PASSWORD_CHANGED: 'fxaccounts:password_changed',
  PASSWORD_RESET: 'fxaccounts:password_reset',
  ACCOUNT_DESTROYED: 'fxaccounts:account_destroyed'
}

var TTL_DEVICE_DISCONNECTED = 5 * 3600 // 5 hours
var TTL_PASSWORD_CHANGED = 6 * 3600 // 6 hours
var TTL_PASSWORD_RESET = TTL_PASSWORD_CHANGED
var TTL_ACCOUNT_DESTROYED = TTL_DEVICE_DISCONNECTED

// An arbitrary, but very generous, limit on the number of active devices.
// Currently only for metrics purposes, not enforced.
var MAX_ACTIVE_DEVICES = 200

var reasonToEvents = {
  accountVerify: {
    send: 'push.account_verify.send',
    success: 'push.account_verify.success',
    resetSettings: 'push.account_verify.reset_settings',
    failed: 'push.account_verify.failed',
    noCallback: 'push.account_verify.no_push_callback',
    noKeys: 'push.account_verify.data_but_no_keys'
  },
  accountConfirm: {
    send: 'push.account_confirm.send',
    success: 'push.account_confirm.success',
    resetSettings: 'push.account_confirm.reset_settings',
    failed: 'push.account_confirm.failed',
    noCallback: 'push.account_confirm.no_push_callback',
    noKeys: 'push.account_confirm.data_but_no_keys'
  },
  passwordReset: {
    send: 'push.password_reset.send',
    success: 'push.password_reset.success',
    resetSettings: 'push.password_reset.reset_settings',
    failed: 'push.password_reset.failed',
    noCallback: 'push.password_reset.no_push_callback',
    noKeys: 'push.password_reset.data_but_no_keys'
  },
  passwordChange: {
    send: 'push.password_change.send',
    success: 'push.password_change.success',
    resetSettings: 'push.password_change.reset_settings',
    failed: 'push.password_change.failed',
    noCallback: 'push.password_change.no_push_callback',
    noKeys: 'push.password_change.data_but_no_keys'
  },
  deviceConnected: {
    send: 'push.device_connected.send',
    success: 'push.device_connected.success',
    resetSettings: 'push.device_connected.reset_settings',
    failed: 'push.device_connected.failed',
    noCallback: 'push.device_connected.no_push_callback',
    noKeys: 'push.device_connected.data_but_no_keys'
  },
  deviceDisconnected: {
    send: 'push.device_disconnected.send',
    success: 'push.device_disconnected.success',
    resetSettings: 'push.device_disconnected.reset_settings',
    failed: 'push.device_disconnected.failed',
    noCallback: 'push.device_disconnected.no_push_callback',
    noKeys: 'push.device_disconnected.data_but_no_keys'
  },
  profileUpdated: {
    send: 'push.profile_updated.send',
    success: 'push.profile_updated.success',
    resetSettings: 'push.profile_updated.reset_settings',
    failed: 'push.profile_updated.failed',
    noCallback: 'push.profile_updated.no_push_callback',
    noKeys: 'push.profile_updated.data_but_no_keys'
  },
  devicesNotify: {
    send: 'push.devices_notify.send',
    success: 'push.devices_notify.success',
    resetSettings: 'push.devices_notify.reset_settings',
    failed: 'push.devices_notify.failed',
    noCallback: 'push.devices_notify.no_push_callback',
    noKeys: 'push.devices_notify.data_but_no_keys'
  },
  accountDestroyed: {
    send: 'push.account_destroyed.send',
    success: 'push.account_destroyed.success',
    resetSettings: 'push.account_destroyed.reset_settings',
    failed: 'push.account_destroyed.failed',
    noCallback: 'push.account_destroyed.no_push_callback',
    noKeys: 'push.account_destroyed.data_but_no_keys'
  }
}

/**
 * A device object returned by the db,
 * typically obtained by calling db.devices(uid).
 * @typedef {Object} Device
 */

module.exports = function (log, db, config) {
  var vapid
  if (config.vapidKeysFile) {
    var vapidKeys = require(config.vapidKeysFile)
    vapid = {
      privateKey: vapidKeys.privateKey,
      publicKey:  vapidKeys.publicKey,
      subject: config.publicUrl
    }
  }

  /**
   * Reports push errors to logs
   *
   * @param {Error} err
   * @param {String} uid
   * @param {String} deviceId
   */
  function reportPushError(err, uid, deviceId) {
    log.error({
      op: LOG_OP_PUSH_TO_DEVICES,
      uid: uid,
      deviceId: deviceId,
      err: err
    })
  }

  /**
   * Reports push increment actions to logs
   *
   * @param {String} name
   */
  function incrementPushAction(name) {
    if (name) {
      log.info({
        op: LOG_OP_PUSH_TO_DEVICES,
        name: name
      })
    }
  }

  /**
   * Copy sendPush authorized options from an existing options object
   * to a new one
   *
   * @param {Object} options
   */
  function filterOptions(options) {
    var allowedProps = ['TTL', 'data']
    return allowedProps.reduce(function(filtered, prop) {
      if (options[prop]) {
        filtered[prop] = options[prop]
      }
      return filtered
    }, {})
  }

  /**
   * iOS clients don't yet support all commands types, and due to
   * platform limitations they have to show some bad fallback UX
   * if they receive an unsupported message type.  Filter out
   * devices that we know won't respond well to the given command.
   *
   * @param {String} command
   * The command from the push message payload
   * @param {Device[]} devices
   * The list of devices to which to send the push.
   */
  function filterSupportedDevices(command, devices) {
    let requiredIOSVersion
    switch (command) {
    case 'sync:collection_changed':
      // Everything supports this message, short-circuit.
      return devices
    case 'fxaccounts:device_connected':
    case 'fxaccounts:device_disconnected':
      requiredIOSVersion = 10.0
      break
    default:
      requiredIOSVersion = Infinity
    }
    return devices.filter(function(device) {
      const deviceOS = device.uaOS && device.uaOS.toLowerCase()
      if (deviceOS === 'ios') {
        const deviceVersion = device.uaBrowserVersion ? parseFloat(device.uaBrowserVersion) : 0
        if (deviceVersion < requiredIOSVersion) {
          log.info({
            op: 'push.filteredUnsupportedDevice',
            command: command,
            uaOS: device.uaOS,
            uaBrowserVersion: device.uaBrowserVersion
          })
          return false
        }
      }
      return true
    })
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

  var dummySigner = crypto.createSign('RSA-SHA256')
  var dummyKey = Buffer.alloc(0)
  var dummyCurve = crypto.createECDH('prime256v1')
  dummyCurve.generateKeys()

  function isValidPublicKey(publicKey) {
    // Try to use the key in an ECDH agreement.
    // If the key is invalid then this will throw an error.
    try {
      dummyCurve.computeSecret(base64url.toBuffer(publicKey))
      return true
    } catch (err) {
      log.info({
        op: 'push.isValidPublicKey',
        name: 'Bad public key detected'
      })
      // However!  The above call might have left some junk
      // sitting around on the openssl error stack.
      // Clear it by deliberately triggering a signing error
      // before anything yields the event loop.
      try {
        dummySigner.sign(dummyKey)
      } catch (e) {}
      return false
    }
  }

  return {

    isValidPublicKey,

    /**
     * Notify devices that there was an update to the account
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @param {String} reason
     * @param {Object} [options]
     *   @param {String[]} [options.includedDeviceIds]
     *   @param {String[]} [options.excludedDeviceIds]
     *   @param {String} [options.data]
     *   @param {String} [options.TTL] (in seconds)
     * @promise
     */
    notifyUpdate (uid, devices, reason, options = {}) {
      if (options.includedDeviceIds) {
        const include = new Set(options.includedDeviceIds)
        devices = devices.filter(device => include.has(device.id))

        if (devices.length === 0) {
          return P.reject('devices empty')
        }
      } else if (options.excludedDeviceIds) {
        const exclude = new Set(options.excludedDeviceIds)
        devices = devices.filter(device => ! exclude.has(device.id))
      }

      return this.sendPush(uid, devices, reason, filterOptions(options))
    },

    /**
     * Notify devices (except currentDeviceId) that a new device was connected
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @param {String} deviceName
     * @param {String} currentDeviceId
     * @promise
     */
    notifyDeviceConnected (uid, devices, deviceName, currentDeviceId) {
      return this.notifyUpdate(uid, devices, 'deviceConnected', {
        data: encodePayload({
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.DEVICE_CONNECTED,
          data: {
            deviceName
          }
        }),
        excludedDeviceIds: [ currentDeviceId ]
      })
    },

    /**
     * Notify devices that a device was disconnected from the account
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @param {String} idToDisconnect
     * @promise
     */
    notifyDeviceDisconnected (uid, devices, idToDisconnect) {
      return this.sendPush(uid, devices, 'deviceDisconnected', {
        data: encodePayload({
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.DEVICE_DISCONNECTED,
          data: {
            id: idToDisconnect
          }
        }),
        TTL: TTL_DEVICE_DISCONNECTED
      })
    },

    /**
     * Notify devices that the profile attached to the account was updated
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @promise
     */
    notifyProfileUpdated (uid, devices) {
      return this.sendPush(uid, devices, 'profileUpdated', {
        data: encodePayload({
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.PROFILE_UPDATED
        })
      })
    },

    /**
     * Notify devices that the password was changed
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @promise
     */
    notifyPasswordChanged (uid, devices) {
      return this.sendPush(uid, devices, 'passwordChange', {
        data: encodePayload({
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.PASSWORD_CHANGED
        }),
        TTL: TTL_PASSWORD_CHANGED
      })
    },

    /**
     * Notify devices that the password was reset
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @promise
     */
    notifyPasswordReset (uid, devices) {
      return this.sendPush(uid, devices, 'passwordReset', {
        data: encodePayload({
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.PASSWORD_RESET
        }),
        TTL: TTL_PASSWORD_RESET
      })
    },

    /**
     * Notify devices that the account no longer exists
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @promise
     */
    notifyAccountDestroyed (uid, devices) {
      return this.sendPush(uid, devices, 'accountDestroyed', {
        data: encodePayload({
          version: PUSH_PAYLOAD_SCHEMA_VERSION,
          command: PUSH_COMMANDS.ACCOUNT_DESTROYED,
          data: {
            uid
          }
        }),
        TTL: TTL_ACCOUNT_DESTROYED
      })
    },

    /**
     * Send a push notification with or without data to a list of devices
     *
     * @param {String} uid
     * @param {Device[]} devices
     * @param {String} reason
     * @param {Object} options
     * @param {String} options.data
     * @param {String} options.TTL (in seconds)
     * @promise
     */
    sendPush: function sendPush(uid, devices, reason, options) {
      options = options || {}
      var command
      try {
        command = JSON.parse(options.data.toString()).command
      } catch (e) {
        command = false
      }
      devices = filterSupportedDevices(command, devices)
      var events = reasonToEvents[reason]
      if (! events) {
        return P.reject('Unknown push reason: ' + reason)
      }
      // There's no spec-compliant way to error out as a result of having
      // too many devices to notify.  For now, just log metrics about it.
      if (devices.length > MAX_ACTIVE_DEVICES) {
        reportPushError(new Error(ERR_TOO_MANY_DEVICES), uid, null)
      }
      return P.each(devices, function(device) {
        var deviceId = device.id

        log.trace({
          op: LOG_OP_PUSH_TO_DEVICES,
          uid: uid,
          deviceId: deviceId,
          pushCallback: device.pushCallback
        })

        if (device.pushCallback && ! device.pushEndpointExpired) {
          // send the push notification
          incrementPushAction(events.send)
          var pushSubscription = { endpoint: device.pushCallback }
          var pushPayload = null
          var pushOptions = { 'TTL': options.TTL || '0' }
          if (options.data) {
            if (! device.pushPublicKey || ! device.pushAuthKey) {
              reportPushError(new Error(ERR_DATA_BUT_NO_KEYS), uid, deviceId)
              incrementPushAction(events.noKeys)
              return
            }
            pushSubscription.keys = {
              p256dh: device.pushPublicKey,
              auth: device.pushAuthKey
            }
            pushPayload = options.data
          }
          if (vapid) {
            pushOptions.vapidDetails = vapid
          }
          return webpush.sendNotification(pushSubscription, pushPayload, pushOptions)
          .then(
            function () {
              incrementPushAction(events.success)
            },
            function (err) {
              // If we've stored an invalid key in the db for some reason, then we
              // might get an encryption failure here.  Check the key, which also
              // happens to work around bugginess in node's handling of said failures.
              var keyWasInvalid = false
              if (! err.statusCode && device.pushPublicKey) {
                if (! isValidPublicKey(device.pushPublicKey)) {
                  keyWasInvalid = true
                }
              }
              // 404 or 410 error from the push servers means
              // the push settings need to be reset.
              // the clients will check this and re-register push endpoints
              if (err.statusCode === 404 || err.statusCode === 410 || keyWasInvalid) {
                // set the push endpoint expired flag
                // Warning: this method is called without any session tokens or auth validation.
                device.pushEndpointExpired = true
                return db.updateDevice(uid, null, device).catch(function (err) {
                  reportPushError(err, uid, deviceId)
                }).then(function() {
                  incrementPushAction(events.resetSettings)
                })
              } else {
                reportPushError(err, uid, deviceId)
                incrementPushAction(events.failed)
              }
            }
          )
        } else {
          // keep track if there are any devices with no push urls.
          reportPushError(new Error(ERR_NO_PUSH_CALLBACK), uid, deviceId)
          incrementPushAction(events.noCallback)
        }
      })
    }
  }
}

function encodePayload (data) {
  return Buffer.from(JSON.stringify(data))
}

