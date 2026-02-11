/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'jsdom-global/register';
import * as Sentry from '@sentry/browser';
import { enableSentry, SentryConfigOpts } from '@fxa/shared/sentry-utils';
import { captureException, initSentry } from './browser';

const config: SentryConfigOpts = {
  release: 'v0.0.0',
  sentry: {
    dsn: 'https://public:private@host:8080/1',
    env: 'test',
    clientName: 'fxa-shared-testing',
    sampleRate: 0,
  },
};

describe('sentry/browser', () => {
  beforeEach(() => {
    enableSentry();
  });

  describe('initSentry', () => {
    it('initializes', () => {
      const spy = jest.spyOn(Sentry, 'init');
      initSentry(config);
      expect(spy).toBeCalledTimes(1);

      spy.mockReset();
      spy.mockRestore();
    });
  });

  describe('captureException', () => {
    it('calls Sentry.captureException', () => {
      const spy = jest.spyOn(Sentry, 'captureException');
      captureException(new Error('testo'));
      expect(spy).toHaveBeenCalled();

      spy.mockReset();
      spy.mockRestore();
    });
  });
});
