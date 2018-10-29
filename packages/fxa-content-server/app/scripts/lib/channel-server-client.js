/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import a256gcm from './crypto/a256gcm';
import base64url from 'base64url';
import ChannelServerClientErrors from './channel-server-client-errors';
import { DEVICE_PAIRING_CHANNEL_KEY_BYTES } from './constants';
import { Model } from 'backbone';
import { pick } from 'underscore';
import hkdf from './crypto/hkdf';
import Url from 'url';

const CHANNEL_KEY_INFO_BUFFER = Buffer.from('identity.mozilla.com/picl/v1/pair/encryption-key', 'utf8');
const CONFIRMATION_CODE_INFO_BUFFER = Buffer.from('identity.mozilla.com/picl/v1/pair/confirmation-code', 'utf8');

const CONFIRMATION_CODE_LENGTH = 4;


/**
 * Connects to the channel server. Expects the following
 * attributes to be passed into the constructor:
 *  - channelId
 *  - channelKey
 *  - channelServerUrl
 *
 * @export
 * @class ChannelServerClient
 * @extends {Model}
 */
export default class ChannelServerClient extends Model {
  constructor (attrs = {}, options = {}) {
    super(attrs, options);

    this.set('isConnected', false);
  }

  /**
   * Open a socket to `channelId` on `channelServerUrl`
   *
   * @param {String} [channelServerUrl=this.get('channelServerUrl')]
   * @param {String} [channelId=this.get('channelId')]
   * @returns {Promise} resolves when connected
   */
  open (channelServerUrl = this.get('channelServerUrl'), channelId = this.get('channelId')) {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        // to avoid opening a duplicate connection, say the client is connected
        // if a socket exists but isn't yet connected.
        return reject(ChannelServerClientErrors.toError('ALREADY_CONNECTED'));
      }

      if (! channelServerUrl || ! channelId) {
        return reject(ChannelServerClientErrors.toError('INVALID_CONFIGURATION'));
      }

      const socketUrl = this._getSocketUrl(channelServerUrl, channelId);
      this.socket = this._createSocket(socketUrl);

      this._proxySocketEvents(this.socket);

      /*eslint-disable no-use-before-define*/
      const close = () => {
        stopListeningToChannelSetupEvents();
        reject(ChannelServerClientErrors.toError('COULD_NOT_CONNECT'));
      };

      const error = () => {
        stopListeningToChannelSetupEvents();
        reject(ChannelServerClientErrors.toError('COULD_NOT_CONNECT'));
      };

      const message = (event) => {
        stopListeningToChannelSetupEvents();

        this._checkFirstMessageDataValidity(event.data, channelId)
          .then(() => {
            this.on('socket:message', (event) => this._encryptedMessageHandler(event));

            this.set('isConnected', true);
            this.trigger('connected');

            resolve();
          }, reject);
      };
      /*eslint-enable no-use-before-define*/

      const stopListeningToChannelSetupEvents = () => {
        this.off('socket:close', close);
        this.off('socket:error', error);
        this.off('socket:message', message);
      };

      this.on('socket:close', close);
      this.on('socket:error', error);
      this.once('socket:message', message);
    });
  }

  /**
   * Close the channel.
   *
   * @returns {Promise} - rejects if no socket, resolves when connection closed
   */
  close () {
    return new Promise((resolve, reject) => {
      if (! this.socket) {
        return reject(ChannelServerClientErrors.toError('NOT_CONNECTED'));
      }

      /*eslint-disable no-use-before-define*/
      const stopListeningToChannelTeardownEvents = () => {
        this.off('socket:close', close);
        this.off('socket:error', error);
      };

      const close = () => {
        stopListeningToChannelTeardownEvents();
        this.set('isConnected', false);
        resolve();
      };

      const error = (err) => {
        stopListeningToChannelTeardownEvents();
        reject(err);
      };
      /*eslint-enable no-use-before-define*/

      this.on('socket:close', close);
      this.on('socket:error', error);

      this.socket.close();
    });
  }

  /**
   * Send `message` with `data` to the remote.
   *
   * @param {String} message name of message to send
   * @param {Any} [data={}]
   * @returns {Promise} resolves when complete
   */
  send (message, data = {}) {
    if (! this.socket || ! this.get('isConnected')) {
      return Promise.reject(ChannelServerClientErrors.toError('NOT_CONNECTED'));
    }

    const envelope = {
      data,
      message,
    };

    return this._encrypt(envelope)
      .then(ciphertext => this.socket.send(ciphertext));
  }

  /**
   * Get the WebSocket URL for `channelServerUrl` and `channelId`
   *
   * @param {String} channelServerUrl
   * @param {String} channelId
   * @returns {String}
   */
  _getSocketUrl (channelServerUrl, channelId = '') {
    // The legacy Url.parse/Url.format combo is used instead of
    // new Url because `new Url` doesn't parse wss:// URLs correctly
    const url = Url.parse(channelServerUrl);
    const pathnameWithoutTrailingSlash = (url.pathname || '').replace(/\/$/, '');
    url.pathname = `${pathnameWithoutTrailingSlash}/${channelId}`;
    return Url.format(url);
  }

  /**
   * Check the first message event's data to ensure it is valid
   * and contains the expected channelID.
   *
   * @param {String} data - data that came from the first message event
   * @param {String} expectedChannelId - if undefined, allows any channelId
   * @returns {Promise} resolves if valid, rejects with an error if not.
   */
  _checkFirstMessageDataValidity (data, expectedChannelId) {
    return Promise.resolve().then(() => {
      const { link } = JSON.parse(data);
      if (! link) {
        throw ChannelServerClientErrors.toError('INVALID_MESSAGE');
      }

      const match = /^\/v1\/ws\/([0-9a-f]{32,32})$/.exec(link);
      if (! match) {
        throw ChannelServerClientErrors.toError('INVALID_MESSAGE');
      }

      if (expectedChannelId && match[1] !== expectedChannelId) {
        throw ChannelServerClientErrors.toError('CHANNEL_ID_MISMATCH');
      }
    }).catch(err => {
      if (/JSON.parse/.test(err.message)) {
        throw ChannelServerClientErrors.toError('INVALID_MESSAGE');
      }

      throw err;
    });
  }

  /**
   * Create a WebSocket to `url`
   *
   * @param {String} url
   * @returns {WebSocket}
   * @private
   */
  _createSocket (url) {
    return new WebSocket(url);
  }

  /**
   * Proxy `socket` events as if they were from
   * the client itself. Events names will have
   * a `socket:` prefix, e.g., `socket:open`,
   * `socket:close`
   *
   * @param {WebSocket} socket
   * @private
   */
  _proxySocketEvents (socket) {
    ['close', 'error', 'message', 'open'].forEach(eventName => {
      socket.addEventListener(eventName, (event) => this.trigger(`socket:${eventName}`, event));
    });
  }

  /**
   * Handle an encrypted message. Expects a message with the
   * following format:
   *
   * ```
   * {
   *   "message": <encrypted message>,
   *   "sender": {
   *      "city": <sender's city name>,
   *      "country": <sender's country name>,
   *      "region": <sender's region>,
   *      "ua": <sender's user agent string>
   *   }
   * }
   * ```
   *
   * The encrypted message is expected to have the following format:
   *
   * ```
   * {
   *   "message": <message name>,
   *   "data": <any, specific to the message>
   * }
   *
   * An event is triggered using `message` as a suffix, e.g.,
   * if the `message` is `pair:auth:metadata`, an event
   * named `remote:path:auth:metadata` will be triggered.
   *
   * An `error` message will be triggered if there is an error
   * parsing or decrypting the message.
   *
   * @param {Object} event
   * @returns {Promise} resolves when complete, rejects if unable to parse or
   *   decrypt the message.
   * @private
   */
  _encryptedMessageHandler (event) {
    return this._decryptAndParseMessageEvent(event)
      .then(({ data, message }) => {
        this.trigger(`remote:${message}`, data);
      })
      .catch(err => this.trigger('error', err));
  }

  /**
   * Parse an event that contains an encrypted message.
   *
   * @param {Event} event
   * @returns {Promise}
   */
  _decryptAndParseMessageEvent (event) {
    return Promise.resolve().then(() => {
      const { message: ciphertext, sender } = JSON.parse(event.data);
      return this._decrypt(ciphertext).then(decrypted => {
        const { data = {}, message } = decrypted;

        if (! message) {
          throw ChannelServerClientErrors.toError('INVALID_MESSAGE');
        }

        data.remoteMetaData = pick(sender, 'city', 'country', 'region', 'ua');

        return {
          data,
          message,
        };
      });
    }).catch(err => {
      if (/JSON.parse/.test(err.message)) {
        throw ChannelServerClientErrors.toError('INVALID_MESSAGE');
      }
      throw err;
    });

  }

  /**
   * Decrypt `ciphertext` using the stored JWK
   *
   * @param {String} ciphertext
   * @returns {Promise} resolves to an object when complete
   * @private
   */
  _decrypt (ciphertext) {
    return this._getChannelJwk()
      .then(key => a256gcm.decrypt(ciphertext, key))
      .then(result => JSON.parse(result))
      .catch(err => ChannelServerClientErrors.toError('COULD_NOT_DECRYPT'));
  }

  /**
   * Encrypt `envelope` using the stored JWK
   *
   * @param {Object} envelope
   * @returns {Promise} Resolves to a string when complete
   * @private
   */
  _encrypt (envelope) {
    return this._getChannelJwk()
      .then(key => a256gcm.encrypt(JSON.stringify(envelope), key));
  }

  /**
   * Get the encryption/decryption JWK for the channel
   *
   * @returns {Promise} resolves to the JWK when complete
   * @private
   */
  _getChannelJwk () {
    const { channelId, channelJwk, channelKey } = this.toJSON();
    if (channelJwk) {
      return Promise.resolve(channelJwk);
    }

    const channelKeyBuffer = base64url.toBuffer(channelKey);
    const channelIdBuffer = base64url.toBuffer(channelId);

    return Promise.all([
      this._deriveChannelJwk(channelKeyBuffer, channelIdBuffer),
      this._deriveConfirmationCode(channelKeyBuffer, channelIdBuffer),
    ]).then(([channelJwk, confirmationCode]) => {
      this.set({
        channelJwk,
        confirmationCode,
      });
      return channelJwk;
    });
  }

  /**
   * Use `channelKeyBuffer` and `channelIdBuffer` to derive
   * the encryption/decryption JWK for the channel
   *
   * @param {Buffer} channelKeyBuffer
   * @param {Buffer} channelIdBuffer
   * @returns {Promise} resolves to the JWK when complete
   * @private
   */
  _deriveChannelJwk(channelKeyBuffer, channelIdBuffer) {
    return this._deriveEncryptionKey(channelKeyBuffer, channelIdBuffer)
      .then(keyBuffer => a256gcm.createJwkFromKey(keyBuffer));
  }

  /**
   * Use `channelKeyBuffer` and `channelIdBuffer` to derive
   * the encryption key.
   *
   * @param {Buffer} channelKeyBuffer
   * @param {Buffer} channelIdBuffer
   * @returns {Promise} resolves to a Buffer containing the encryption key
   * @private
   */
  _deriveEncryptionKey(channelKeyBuffer, channelIdBuffer) {
    return hkdf(channelKeyBuffer, channelIdBuffer, CHANNEL_KEY_INFO_BUFFER, DEVICE_PAIRING_CHANNEL_KEY_BYTES);
  }

  /**
   * Use `channelKeyBuffer` and `channelIdBuffer` to derive the
   * channel confirmation code.
   *
   * @param {Buffer} channelKeyBuffer
   * @param {Buffer} channelIdBuffer
   * @returns {Promise} resolves to an 8 character String containing the confirmation code
   * @private
   */
  _deriveConfirmationCode(channelKeyBuffer, channelIdBuffer) {
    return hkdf(channelKeyBuffer, channelIdBuffer, CONFIRMATION_CODE_INFO_BUFFER, CONFIRMATION_CODE_LENGTH)
      .then(confirmationCodeBuffer => confirmationCodeBuffer.toString('hex'));
  }

}
