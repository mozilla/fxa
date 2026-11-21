/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppError as error } from '@fxa/accounts/errors';

import {
  deauthorizeOnDisconnect,
  DeauthorizeOnDisconnectOauthDB,
} from './deauthorize-on-disconnect';

export interface RevokeDeviceRefreshTokenOauthDB
  extends DeauthorizeOnDisconnectOauthDB {
  getRefreshToken(
    tokenId: string
  ): Promise<{ clientId?: Buffer | string } | null | undefined>;
  removeRefreshToken(token: unknown): Promise<unknown>;
}

/**
 * Revokes the refresh token a deleted device was registered with, then
 * deauthorizes any accountAuthorizations rows it alone sustained. Never
 * throws: the device record is already gone, so the caller cannot retry.
 */
export async function revokeDeviceRefreshToken(
  deps: {
    oauthDB: RevokeDeviceRefreshTokenOauthDB;
    log: { error(op: string, data: Record<string, unknown>): void };
  },
  uid: string,
  refreshTokenId: string
): Promise<void> {
  const { oauthDB, log } = deps;
  // Firefox Desktop destroys the refresh token its device was registered
  // with, so refreshTokenId can dangle and the lookup come back empty.
  let clientId: string | undefined;
  try {
    const token = await oauthDB.getRefreshToken(refreshTokenId);
    if (token) {
      clientId =
        typeof token.clientId === 'string'
          ? token.clientId
          : token.clientId?.toString('hex');
      await oauthDB.removeRefreshToken(token);
    }
  } catch (err: any) {
    // The refresh token might already have been deleted, because distributed
    // state.
    if (err.errno !== error.ERRNO.INVALID_TOKEN) {
      log.error('deviceDestroy.revokeRefreshTokenById.error', {
        err: err.message,
      });
    }
  }

  // Runs even if the removal above threw: the policy re-reads, so a token
  // that survived keeps its row and one already gone releases it. An unset
  // clientId means nothing was removed, and the pass no-ops.
  await deauthorizeOnDisconnect({ oauthDB }, { uid, clientId });
}
