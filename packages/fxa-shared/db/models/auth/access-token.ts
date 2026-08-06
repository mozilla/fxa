/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as encrypt from '../../../auth/encrypt';
import ScopeSet from '../../../oauth/scopes';

export class AccessToken {
  constructor(
    public tokenId: Buffer,
    public clientId: Buffer,
    public name: string,
    public canGrant: boolean,
    public publicClient: boolean,
    public userId: Buffer,
    public scope: any,
    public createdAt: Date,
    public profileChangedAt: number,
    public expiresAt: Date,
    public token: Buffer | null,
    public type: string = 'bearer',
    // Authentication-event metadata for RFC 9470 step-up. Present on tokens
    // minted from a grant that carried them; undefined for legacy/other tokens.
    public authAt?: number, // seconds since epoch (the authentication event)
    public amr?: string[],
    public aal?: number
  ) {}

  get clientCanGrant() {
    return this.canGrant;
  }

  get clientName() {
    return this.name;
  }

  get ttl() {
    return this.expiresAt.getTime() - Date.now();
  }

  get lastAccessTime() {
    return this.createdAt;
  }

  /**
   *
   * @returns {object}
   */
  toJSON() {
    return {
      tokenId: this.tokenId.toString('hex'),
      clientId: this.clientId.toString('hex'),
      name: this.name,
      canGrant: this.canGrant,
      publicClient: this.publicClient,
      userId: this.userId.toString('hex'),
      scope: this.scope.toString(),
      createdAt: this.createdAt.getTime(),
      profileChangedAt: this.profileChangedAt,
      expiresAt: this.expiresAt.getTime(),
      // JSON.stringify omits these keys when undefined, so tokens without
      // authentication-event metadata serialize exactly as before.
      authAt: this.authAt,
      amr: this.amr,
      aal: this.aal,
    };
  }

  /**
   *
   * @param {string} string
   * @returns {AccessToken}
   */
  static parse(string: string) {
    const json = JSON.parse(string);
    // We previously wrote the raw token into redis, but are now writing
    // only the hashed tokenId.
    let tokenId;
    if (json.tokenId) {
      tokenId = Buffer.from(json.tokenId, 'hex');
    } else {
      tokenId = encrypt.hash(Buffer.from(json.token, 'hex'));
    }
    return new AccessToken(
      tokenId,
      Buffer.from(json.clientId, 'hex'),
      json.name,
      json.canGrant,
      json.publicClient,
      Buffer.from(json.userId, 'hex'),
      ScopeSet.fromString(json.scope),
      new Date(json.createdAt),
      json.profileChangedAt,
      new Date(json.expiresAt),
      null,
      'bearer',
      json.authAt,
      json.amr,
      json.aal
    );
  }
}
