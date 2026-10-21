/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as Sentry from '@sentry/node';
import { ErrorEvent } from '@sentry/core';
import { InitSentryOpts, Logger } from '@fxa/shared/sentry-utils';
import { initSentry } from './node';

jest.mock('@sentry/node', () => {
  const actual = jest.requireActual('@sentry/node');
  return {
    ...actual,
    init: jest.fn(),
  };
});

const log: Logger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

describe('sentry/node', () => {
  describe('initSentry', () => {
    it('tags a critical endpoint event before eventFilters run', () => {
      const eventFilter = jest.fn((event: ErrorEvent) => event);
      const config: InitSentryOpts = {
        release: 'v0.0.0',
        sentry: {
          dsn: 'https://public:private@host:8080/1',
          env: 'test',
          serverName: 'fxa-shared-testing',
          sampleRate: 0,
        },
        eventFilters: [eventFilter],
      };

      initSentry(config, log);

      const beforeSend = jest.mocked(Sentry.init).mock.calls[0][0]?.beforeSend;
      const event = beforeSend?.(
        {
          type: undefined,
          request: { url: 'https://example.com/v1/account/login' },
        },
        {}
      ) as ErrorEvent;

      expect(event.tags?.['fxa.endpoint.type']).toBe('critical');
      expect(event.tags?.['fxa.name']).toBe('fxa-shared-testing');
      expect(eventFilter.mock.calls[0][0].tags?.['fxa.endpoint.type']).toBe(
        'critical'
      );
    });
  });
});
