/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { MysqlStoreShared } = require('fxa-shared/db/mysql');
const buf = require('buf').hex;
const AppError = require('../../error');
const config = require('../../config');
const logger = require('../../logging')('db.mysql');

const REQUIRED_SQL_MODES = ['STRICT_ALL_TABLES', 'NO_ENGINE_SUBSTITUTION'];
const REQUIRED_CHARSET = 'UTF8MB4_BIN';

const Q_AVATAR_INSERT =
  'INSERT INTO avatars (id, url, userId, providerId) VALUES (?, ?, ?, ?)';
const Q_AVATAR_UPDATE =
  'INSERT INTO avatar_selected (userId, avatarId) VALUES (?, ?) ON DUPLICATE KEY UPDATE avatarId = VALUES(avatarId)';
const Q_AVATAR_GET = 'SELECT * FROM avatars WHERE id=?';
const Q_SELECTED_AVATAR =
  'SELECT avatars.* FROM avatars LEFT JOIN avatar_selected ON (avatars.id = avatar_selected.avatarId) WHERE avatars.userId=? AND avatar_selected.avatarId IS NOT NULL';
const Q_AVATAR_DELETE = 'DELETE FROM avatars WHERE id=?';
const Q_USER_AVATARS_DELETE = 'DELETE FROM avatars where userId=?';
const Q_PROVIDER_INSERT = 'INSERT INTO avatar_providers (name) VALUES (?)';
const Q_PROVIDER_GET_BY_NAME = 'SELECT * FROM avatar_providers WHERE name=?';
const Q_PROVIDER_GET_BY_ID = 'SELECT * FROM avatar_providers WHERE id=?';
const Q_PROFILE_DISPLAY_NAME_UPDATE =
  'INSERT INTO profile (userId, displayName) VALUES (?, ?) ON DUPLICATE KEY UPDATE displayName = VALUES(displayName)';
const Q_PROFILE_DISPLAY_NAME_GET = 'SELECT displayName FROM profile WHERE userId=?';
const Q_PROFILE_DELETE = 'DELETE FROM profile WHERE userId=?';

class ProfileMysqlStore extends MysqlStoreShared {
  constructor(options, events, log, metrics) {
    super(options, events, log, metrics);
  }

  async ping() {
    logger.debug('ping');
    const conn = await this._getConnection();
    try {
      await new Promise((resolve, reject) => {
        conn.ping((err) => {
          if (err) {
            logger.error('ping', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } finally {
      conn.release();
    }
  }

  async addAvatar(id, uid, url, provider) {
    id = buf(id);
    uid = buf(uid);
    const prov = await this.getProviderByName(provider);
    if (!prov) {
      throw AppError.unsupportedProvider(url);
    }
    await this._write(Q_AVATAR_INSERT, [id, url, uid, prov.id]);
    // always select the newly uploaded avatar
    await this._write(Q_AVATAR_UPDATE, [uid, id]);
  }

  getAvatar(id) {
    return this._readOne(Q_AVATAR_GET, [buf(id)]);
  }

  getSelectedAvatar(uid) {
    return this._readOne(Q_SELECTED_AVATAR, [buf(uid)]);
  }

  deleteAvatar(id) {
    return this._write(Q_AVATAR_DELETE, [buf(id)]);
  }

  deleteUserAvatars(uid) {
    return this._write(Q_USER_AVATARS_DELETE, [buf(uid)]);
  }

  addProvider(name) {
    return this._write(Q_PROVIDER_INSERT, [name]);
  }

  getProviderByName(name) {
    return this._readOne(Q_PROVIDER_GET_BY_NAME, [name]);
  }

  getProviderById(id) {
    return this._readOne(Q_PROVIDER_GET_BY_ID, [id]);
  }

  setDisplayName(uid, displayName) {
    return this._write(Q_PROFILE_DISPLAY_NAME_UPDATE, [buf(uid), displayName]);
  }

  getDisplayName(uid) {
    return this._readOne(Q_PROFILE_DISPLAY_NAME_GET, [buf(uid)]);
  }

  removeProfile(uid) {
    return this._write(Q_PROFILE_DELETE, [buf(uid)]);
  }

  async disconnect() {
    await this.close();
  }

  // For tests
  async _clear() {
    await this._write('DELETE FROM avatar_selected;');
    await this._write('DELETE FROM avatars;');
    await this._write('DELETE FROM avatar_providers;');
  }
}

ProfileMysqlStore.connect = async function (options, events, log, metrics) {
  return new ProfileMysqlStore(options, events, log, metrics);
};

module.exports = ProfileMysqlStore;
