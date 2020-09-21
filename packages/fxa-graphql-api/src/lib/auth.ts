/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthClient from 'fxa-auth-client';
import { Service, Inject } from 'typedi';
import { AuthenticationError, ApolloError } from 'apollo-server';

import { fxAccountClientToken } from './constants';

@Service()
export class SessionTokenAuth {
  @Inject(fxAccountClientToken)
  private authClient!: AuthClient;

  public async getSessionStatus(sessionToken: string) {
    try {
      return await this.authClient.sessionStatus(sessionToken);
    } catch (err) {
      if (err.code === 400 || err.code === 401) {
        // AuthenticationError doesn't allow us to pass along the error code,
        // but the error message is unique for most auth-server errors.
        throw new AuthenticationError(err.message);
      } else {
        throw new ApolloError(err.message, '' + err.errno, {
          errno: err.errno,
          code: err.code,
        });
      }
    }
  }
}
