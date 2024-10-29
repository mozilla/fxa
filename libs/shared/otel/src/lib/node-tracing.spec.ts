/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { initTracing } from './node-tracing';

describe('Initializes node tracing', () => {
  it('flags when code and errno are present', () => {
    const nodeTracing = initTracing(
      {
        batchProcessor: false,
        clientName: 'test',
        corsUrls: '',
        filterPii: false,
        sampleRate: 0,
        serviceName: 'test',
        console: {
          enabled: true,
        },
      },
      console
    );

    expect(nodeTracing).toBeDefined();
  });
});
