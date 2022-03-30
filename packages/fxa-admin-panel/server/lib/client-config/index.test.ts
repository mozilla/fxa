/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ClientConfig } from '.';
import { SERVER_CONFIG_PLACEHOLDER } from '../../../constants';
import { JSDOM } from 'jsdom';

describe('ClientConfig', () => {
  it('provides default config', () => {
    const config = ClientConfig.defaultConfig;
    expect(config).toBeDefined();
  });

  it('injects into html', () => {
    const html = `<head><meta name="fxa-config" content="${SERVER_CONFIG_PLACEHOLDER}"/></meta></head>`;
    const expectedConfig = Object.assign({}, ClientConfig.defaultConfig, {
      user: { email: 'bar', group: 'foo', permissions: {} },
    });
    const injectedHtml = ClientConfig.injectIntoHtml(html, {
      'REMOTE-GROUP': expectedConfig.user.group,
      'oidc-claim-id-token-email': expectedConfig.user.email,
    });

    const injectedVal = JSDOM.fragment(injectedHtml)
      .querySelector('meta[name="fxa-config"]')
      ?.getAttribute('content');

    expect(injectedVal).toBeDefined();
    expect(injectedHtml).not.toEqual(html);
    expect(JSON.parse(decodeURIComponent(injectedVal || ''))).toEqual(
      expectedConfig
    );
  });
});
