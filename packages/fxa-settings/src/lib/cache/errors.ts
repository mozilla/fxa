/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class MissingCachedAccount extends Error {
  constructor() {
    super('Detected cached state with no active account! Sign back in!');
  }
}

export class MissingCachedSessionError extends Error {
  constructor() {
    super('Detected account without session token. Sign back in!');
  }
}

export class InvalidCachedAccountState extends Error {
  constructor(reason?: string) {
    super(`Invalid cached account detected. ${reason || ''}`);
  }
}
