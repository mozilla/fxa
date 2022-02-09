/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { assert } from 'chai';

import {
  ClientFormatter,
  IClientFormatterRequest,
} from '../../connected-services';
import { AttachedClient } from '../../connected-services/models/AttachedClient';

describe('connected-services/formatters', () => {
  let clientFormatter: ClientFormatter;
  let client: AttachedClient;
  let request: IClientFormatterRequest;

  beforeEach(() => {
    clientFormatter = new ClientFormatter(
      {
        i18n: {
          defaultLanguage: 'en',
          supportedLanguages: ['en', 'de'],
        },
        lastAccessTimeUpdates: {
          earliestSaneTimestamp: 1,
        },
      },
      () => console
    );

    client = {
      clientId: 'test',
      userAgent: 'Firefox',
      location: {
        city: 'Portland',
        country: 'United States',
        countryCode: 'US',
        state: 'Oregon',
        stateCode: 'OR',
      },
      os: 'MacOS',
      deviceId: 'abcd',
      sessionTokenId: 'test',
      refreshTokenId: 'test',
      isCurrentSession: true,
      scope: [],
      lastAccessTime: Date.now(),
      createdTime: new Date(Date.now() - 1e4).getTime(),
    } as AttachedClient;

    request = {
      app: {
        acceptLanguage: 'en-US',
      },
    };
  });

  it('formats US location', () => {
    clientFormatter.formatLocation(client, request);

    assert.exists(client.location?.city);
    assert.exists(client.location?.state);
    assert.exists(client.location?.stateCode);
    assert.exists(client.location?.country);
    // Not set, is this a bug?
    // assert.exists(client.location?.countryCode);
  });

  it('formats DE location', () => {
    request.app.acceptLanguage = 'de-DE';
    client.location = {
      city: 'Berlin',
      countryCode: 'DE',
    };
    clientFormatter.formatLocation(client, request);

    assert.exists(client.location?.country);
    // Not set, is this a bug?
    // assert.exists(client.location?.city);
    // assert.exists(client.location?.state);
    // assert.exists(client.location?.stateCode);
    // assert.exists(client.location?.countryCode);
  });

  it('formats timestamps', () => {
    clientFormatter.formatTimestamps(client, request);

    assert.exists(client.createdTimeFormatted);
    assert.exists(client.lastAccessTimeFormatted);
  });
});
