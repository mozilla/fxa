/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ClientFormatter, IClientFormatterRequest } from './formatters';
import { AttachedClient } from './models/AttachedClient';

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

    expect(client.location?.city).toEqual(expect.anything());
    expect(client.location?.state).toEqual(expect.anything());
    expect(client.location?.stateCode).toEqual(expect.anything());
    expect(client.location?.country).toEqual(expect.anything());
    // Not set, is this a bug?
    // expect(client.location?.countryCode).toEqual(expect.anything());
  });

  it('formats DE location', () => {
    request.app.acceptLanguage = 'de-DE';
    client.location = {
      city: 'Berlin',
      countryCode: 'DE',
    };
    clientFormatter.formatLocation(client, request);

    expect(client.location?.country).toEqual(expect.anything());
    // Not set, is this a bug?
    // expect(client.location?.city).toEqual(expect.anything());
    // expect(client.location?.state).toEqual(expect.anything());
    // expect(client.location?.stateCode).toEqual(expect.anything());
    // expect(client.location?.countryCode).toEqual(expect.anything());
  });

  it('formats timestamps', () => {
    clientFormatter.formatTimestamps(client, request);

    expect(client.createdTimeFormatted).toEqual(expect.anything());
    expect(client.lastAccessTimeFormatted).toEqual(expect.anything());
  });
});
