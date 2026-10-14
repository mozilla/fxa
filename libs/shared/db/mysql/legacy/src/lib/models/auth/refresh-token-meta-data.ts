/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class RefreshTokenMetadata {
  public lastUsedAt: Date;

  constructor(lastUsedAt?: Date | null) {
    this.lastUsedAt = lastUsedAt || new Date();
  }

  toJSON() {
    return {
      lastUsedAt: this.lastUsedAt.getTime(),
    };
  }

  static parse(string: string) {
    const json = JSON.parse(string);
    return new RefreshTokenMetadata(new Date(json.lastUsedAt));
  }
}
