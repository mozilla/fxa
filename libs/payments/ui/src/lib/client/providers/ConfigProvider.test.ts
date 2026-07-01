/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { ConfigContextValues } from './ConfigProvider';

describe('ConfigContextValues sentry shape', () => {
  it('does not include server-only sentry fields', () => {
    const sentryConfig: ConfigContextValues['sentry'] = {
      clientDsn: 'https://test@sentry.io/123',
      env: 'test',
      clientName: 'test-client',
      sampleRate: 1,
      tracesSampleRate: 1,
    };

    expect(sentryConfig).not.toHaveProperty('dsn');
    expect(sentryConfig).not.toHaveProperty('serverName');
    expect(sentryConfig).not.toHaveProperty('authToken');
  });
});
