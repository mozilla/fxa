/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthClient {
  private async request(
    method: string,
    path: string,
    payload: object | null,
    extraHeaders: Headers | undefined
  ) {
    if (extraHeaders === undefined) {
      if (this.requireHeaders) {
        throw new Error('extraHeaders missing!');
      } else {
        extraHeaders = new Headers();
      }
    }

    extraHeaders.set('Content-Type', 'application/json');
    const response = await fetchOrTimeout(
      this.url(path),
      {
        method,
        headers: extraHeaders,
        body: cleanStringify(payload),
      },
      this.timeout
    );
    let result: any = await response.text();
    try {
      result = JSON.parse(result);
    } catch (e) {}
    if (result.errno) {
      throw result;
    }
    if (!response.ok) {
      throw new AuthClientError('Unknown error', result, 999, response.status);
    }

    return result;
  }

  public async getMetricsFlow() {
    // GET /metrics-flow off of fxa-auth-server
  }
}
