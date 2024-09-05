/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SentryConfigOpts } from '../models/SentryConfigOpts';
import { beforeSend } from './beforeSend.client';
import * as Sentry from '@sentry/nextjs';

const config: SentryConfigOpts = {
  release: 'v0.0.0',
  sentry: {
    dsn: 'https://public:private@host:8080/1',
    env: 'test',
    clientName: 'fxa-shared-testing',
    sampleRate: 0,
  },
};

const sentryEnabled = true;

describe('beforeSend', () => {
  it('works without request url', () => {
    const data = {
      key: 'value',
    } as unknown as Sentry.ErrorEvent;

    const resultData = beforeSend(sentryEnabled, config, data);

    expect(data).toEqual(resultData);
  });

  it('fingerprints errno', () => {
    const data = {
      request: {
        url: 'https://example.com',
      },
      tags: {
        errno: '100',
      },
      type: undefined,
    } as Sentry.ErrorEvent;

    const resultData = beforeSend(sentryEnabled, config, data);
    expect(resultData?.fingerprint?.[0]).toEqual('errno100');
    expect(resultData?.level).toEqual('info');
  });

  it('properly erases sensitive information from url', () => {
    const url = 'https://accounts.firefox.com/complete_reset_password';
    const badQuery =
      '?token=foo&code=bar&email=some%40restmail.net&service=sync';
    const goodQuery = '?token=VALUE&code=VALUE&email=VALUE&service=sync';
    const badData = {
      request: {
        url: url + badQuery,
      },
    } as Sentry.ErrorEvent;

    const goodData = {
      request: {
        url: url + goodQuery,
      },
    };

    const resultData = beforeSend(sentryEnabled, config, badData);
    expect(resultData?.request?.url).toEqual(goodData.request.url);
  });

  it('properly erases sensitive information from referrer', () => {
    const url = 'https://accounts.firefox.com/complete_reset_password';
    const badQuery =
      '?token=foo&code=bar&email=some%40restmail.net&service=sync';
    const goodQuery = '?token=VALUE&code=VALUE&email=VALUE&service=sync';
    const badData = {
      request: {
        headers: {
          Referer: url + badQuery,
        },
      },
      type: undefined,
    } as Sentry.ErrorEvent;

    const goodData = {
      request: {
        headers: {
          Referer: url + goodQuery,
        },
      },
    };

    const resultData = beforeSend(sentryEnabled, config, badData);
    expect(resultData?.request?.headers?.Referer).toEqual(
      goodData.request.headers.Referer
    );
  });

  it('properly erases sensitive information from abs_path', () => {
    const url = 'https://accounts.firefox.com/complete_reset_password';
    const badCulprit = 'https://accounts.firefox.com/scripts/57f6d4e4.main.js';
    const badAbsPath =
      'https://accounts.firefox.com/complete_reset_password?token=foo&code=bar&email=a@a.com&service=sync&resume=barbar';
    const goodAbsPath =
      'https://accounts.firefox.com/complete_reset_password?token=VALUE&code=VALUE&email=VALUE&service=sync&resume=VALUE';
    const data = {
      culprit: badCulprit,
      exception: {
        values: [
          {
            stacktrace: {
              frames: [
                {
                  abs_path: badAbsPath, // eslint-disable-line camelcase
                },
                {
                  abs_path: badAbsPath, // eslint-disable-line camelcase
                },
              ],
            },
          },
        ],
      },
      request: {
        url,
      },
      type: undefined,
    };

    const resultData = beforeSend(sentryEnabled, config, data);

    expect(
      resultData?.exception?.values?.[0].stacktrace?.frames?.[0].abs_path
    ).toEqual(goodAbsPath);
    expect(
      resultData?.exception?.values?.[0].stacktrace?.frames?.[1].abs_path
    ).toEqual(goodAbsPath);
  });
});
