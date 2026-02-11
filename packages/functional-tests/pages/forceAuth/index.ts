/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from '../layout';
import uaStrings from '../../lib/ua-strings';
import { Credentials } from '../../lib/targets/base';

export class ForceAuthPage extends BaseLayout {
  readonly path = 'force_auth';
  context = '';
  service = '';

  async openWithReplacementParams(
    credentials: Credentials,
    replacementParams: { [keys: string]: string | undefined }
  ) {
    const params = this.buildQueryParams(credentials);
    const params2: Record<string, any> = { ...params, ...replacementParams };
    Object.keys(params2).forEach((k) => {
      if (params2[k] === undefined) {
        delete params2[k];
      }
    });
    await this.openWithParams(params2);
  }

  async open(credentials: Credentials) {
    await this.openWithParams(this.buildQueryParams(credentials));
  }

  private async openWithParams(
    params: Partial<ReturnType<ForceAuthPage['buildQueryParams']>>
  ) {
    await this.openWithQueryParams(params);
    await this.listenToWebChannelMessages();
  }

  private buildQueryParams(credentials: Credentials) {
    return {
      automatedBrowser: true,
      context: this.context,
      email: credentials.email,
      forceUA: uaStrings['desktop_firefox_71'],
      service: this.service,
      uid: credentials.uid,
    };
  }

  private openWithQueryParams(
    queryParam: Partial<ReturnType<ForceAuthPage['buildQueryParams']>>
  ) {
    const query = Object.keys(queryParam)
      .map((k) => `${k}=${encodeURIComponent((queryParam as any)[k])}`)
      .join('&');
    const url = `${this.url}?${query}`;
    return this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }
}
