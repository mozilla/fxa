/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Client } from 'fxa-js-client';
import { Service, Inject } from 'typedi';
import { AuthenticationError } from 'apollo-server';

import { fxAccountClientToken } from './constants';

@Service()
export class SessionTokenAuth {
  @Inject(fxAccountClientToken)
  private authClient!: Client;

  public async lookupUserId(sessionToken: string): Promise<string> {
    try {
      const result = await this.authClient.sessionStatus(sessionToken);
      return result.uid;
    } catch (err) {
      console.log(err);
      throw new AuthenticationError('Invalid session token: ' + err);
    }
  }
}
