/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import {
  MAX_L10N_ERROR_REPORTS,
  flushL10nErrorReports,
  reportL10nError,
  resetL10nErrorReporter,
} from './l10n-error-reporter';

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}));

const mockCaptureException = Sentry.captureException as jest.MockedFunction<
  typeof Sentry.captureException
>;

describe('reportL10nError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetL10nErrorReporter();
  });

  describe('before metrics are enabled', () => {
    it('does not send to Sentry, which would discard the event', () => {
      reportL10nError(
        new Error('No static asset mapping for l10n bundle'),
        'fr'
      );

      expect(mockCaptureException).not.toHaveBeenCalled();
    });

    it('sends the buffered reports once flushed', () => {
      const first = new Error(
        'No static asset mapping for locales/fr/main.ftl'
      );
      const second = new Error('Fetching l10n static asset manifest failed');

      reportL10nError(first, 'fr');
      reportL10nError(second);
      flushL10nErrorReports();

      expect(mockCaptureException).toHaveBeenCalledTimes(2);
      expect(mockCaptureException).toHaveBeenCalledWith(first, {
        tags: { area: 'l10n' },
        extra: { locale: 'fr' },
      });
    });
  });

  describe('after metrics are enabled', () => {
    beforeEach(() => {
      flushL10nErrorReports();
    });

    it('reports the error to Sentry tagged as l10n with the failing locale', () => {
      const error = new Error('No static asset mapping for l10n bundle');

      reportL10nError(error, 'fr');

      expect(mockCaptureException).toHaveBeenCalledWith(error, {
        tags: { area: 'l10n' },
        extra: { locale: 'fr' },
      });
    });

    it('attaches no locale when the failure is not locale specific', () => {
      const error = new Error('Fetching l10n static asset manifest failed');

      reportL10nError(error);

      expect(mockCaptureException).toHaveBeenCalledWith(error, {
        tags: { area: 'l10n' },
        extra: undefined,
      });
    });

    it('reports a repeated message only once', () => {
      const message =
        'No static asset mapping for l10n bundle: locales/fr/main.ftl';
      reportL10nError(new Error(message), 'fr');
      reportL10nError(new Error(message), 'fr');

      expect(mockCaptureException).toHaveBeenCalledTimes(1);
    });

    it(`stops reporting after ${MAX_L10N_ERROR_REPORTS} distinct messages`, () => {
      for (let i = 0; i < MAX_L10N_ERROR_REPORTS + 5; i++) {
        reportL10nError(
          new Error(`No static asset mapping for bundle ${i}`),
          'fr'
        );
      }

      expect(mockCaptureException).toHaveBeenCalledTimes(
        MAX_L10N_ERROR_REPORTS
      );
    });
  });
});
