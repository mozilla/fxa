/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { normalizeXHRError } from './oauth-errors';

const DESTROY_TOKEN = '/v1/destroy';
const GET_CLIENT = '/v1/client/';

export class OAuthClient {
  constructor(protected readonly oAuthUrl: string) {}

  async getClientInfo(id: string) {
    const response = await fetch(`${this.oAuthUrl}${GET_CLIENT}${id}`);
    if (response.status === 200) {
      return response.json();
    } else {
      normalizeXHRError(response);
    }
  }

  async destroyToken(token: string) {
    const response = await fetch(`${this.oAuthUrl}${DESTROY_TOKEN}`, {
      body: JSON.stringify({ token }),
    });
    if (response.status === 200) {
      return response.json();
    } else {
      normalizeXHRError(response);
    }
  }
}
