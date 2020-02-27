/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

class RefreshTokenMetadata {
  constructor(lastUsedAt) {
    /** @type {Date} */
    this.lastUsedAt = lastUsedAt || new Date();
  }

  /**
   *
   * @returns {object}
   */
  toJSON() {
    return {
      lastUsedAt: this.lastUsedAt.getTime(),
    };
  }

  /**
   *
   * @param {string} string
   * @returns {RefreshTokenMetadata}
   */
  static parse(string) {
    const json = JSON.parse(string);
    return new RefreshTokenMetadata(new Date(json.lastUsedAt));
  }
}

module.exports = RefreshTokenMetadata;
