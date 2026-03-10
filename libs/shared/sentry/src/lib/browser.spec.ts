/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'jsdom-global/register';
import * as Sentry from '@sentry/browser';
import * as sentryWrapper from './browser';
import { SentryConfigOpts } from '@fxa/shared/sentry-utils';

jest.mock('@sentry/browser', () => {
  const actual = jest.requireActual('@sentry/browser');
  return {
    ...actual,
    init: jest.fn(),
    captureException: jest.fn(),
  };
});

const config: SentryConfigOpts = {
  release: 'v0.0.0',
  sentry: {
    dsn: 'https://public:private@host:8080/1',
    env: 'test',
    clientName: 'fxa-shared-testing',
    sampleRate: 0,
  },
};
const logger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

describe('sentry/browser', () => {
  beforeEach(() => {
    // Make sure it's enabled by default
    sentryWrapper.enable();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  describe('init', () => {
    it('properly configures with dsn', () => {
      sentryWrapper.configure(config, logger);
    });
  });

  describe('beforeSend', () => {
    beforeAll(() => {
      sentryWrapper.configure(config, logger);
    });

    it('works without request url', () => {
      const data = {
        key: 'value',
        type: undefined,
      } as Sentry.ErrorEvent;

      const resultData = sentryWrapper.beforeSend(config, data, {});

      expect(data).toEqual(resultData);
    });

    it('fingerprints errno', () => {
      const data = {
        type: undefined,
        request: {
          url: 'https://example.com',
        },
        tags: {
          errno: '100',
        },
      } as Sentry.ErrorEvent;

      const resultData = sentryWrapper.beforeSend(config, data, {});
      expect(resultData?.fingerprint?.[0]).toEqual('errno100');
      expect(resultData?.level).toEqual('info');
    });
  });

  describe('captureException', () => {
    it('calls Sentry.captureException', () => {
      const spy = jest.spyOn(Sentry, 'captureException');
      Sentry.captureException(new Error('testo'));
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('disable / enables', () => {
    it('enables', () => {
      sentryWrapper.enable();
      expect(sentryWrapper.isEnabled()).toBeTruthy();
    });

    it('disables', () => {
      sentryWrapper.disable();
      expect(sentryWrapper.isEnabled()).toBeFalsy();
    });

    it('will return null from before send when disabled', () => {
      sentryWrapper.disable();
      expect(sentryWrapper.beforeSend({}, { type: undefined }, {})).toBeNull();
    });
  });
});
