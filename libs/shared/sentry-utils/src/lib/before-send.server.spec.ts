/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { beforeSendServer } from './before-send.server';
import { filterSentryEvent } from './utils';

describe('beforeSendServer', () => {
  const config = {
    release: 'v0.0.0',
    sentry: {
      dsn: 'https://public:private@host:8080/1',
      env: 'test',
      clientName: 'fxa-shared-testing',
      sampleRate: 0,
    },
    eventFilters: [filterSentryEvent],
  };

  it('adjust event before send', () => {
    const data = {
      type: undefined,
      key: 'value',
      extra: {
        uid: '123',
      },
    };
    const hint = {};
    const modified = beforeSendServer(config, data, hint);
    expect(modified?.tags?.['fxa.name']).toEqual('unknown');
    expect(modified?.extra?.['uid']).toEqual('[Filtered]');
  });
});
