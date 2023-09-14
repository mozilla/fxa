/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { localizeTimestamp } from './localize-timestamp';

describe('l10n/localizeTimestamp:', () => {
  describe('call with supported language:', () => {
    let format: any;

    beforeAll(() => {
      format = localizeTimestamp({
        defaultLanguage: 'en',
        supportedLanguages: ['ar', 'es', 'ru'],
      }).format;
    });

    it('returns the empty string if called without arguments', () => {
      expect(format()).toStrictEqual('');
    });

    it('returns the default language if called without an Accept-Language header', () => {
      expect(format(Date.now() - 1)).toEqual('a few seconds ago');
    });

    it('returns the requested language if called with an Accept-Language header', () => {
      expect(format(Date.now() - 1, 'ru,en-GB;q=0.5,en;q=0.3')).toEqual(
        'несколько секунд назад'
      );
    });

    it('returns the requested language if called with a single language', () => {
      expect(format(Date.now() - 1, 'ru')).toEqual('несколько секунд назад');
    });

    it('returns the requested language if called with a language variation', () => {
      expect(format(Date.now() - 1, 'es-mx, ru')).toEqual('hace unos segundos');
    });

    it('returns a fallback language if called with unsupported language variations', () => {
      expect(format(Date.now() - 1, 'de, fr;q=0.8, ru;q=0.5')).toEqual(
        'несколько секунд назад'
      );
    });

    it('returns the default language if called with an unsupported language', () => {
      expect(format(Date.now() - 1, 'qu')).toEqual('a few seconds ago');
    });

    it('returns the default language if called with the default language', () => {
      expect(format(Date.now() - 1, 'en')).toEqual('a few seconds ago');
    });

    it('returns the first supported language if called with the first supported language', () => {
      expect(format(Date.now() - 1, 'ar')).toEqual('منذ ثانية واحدة');
    });
  });

  describe('call with no supported languages:', () => {
    let format: (timestamp?: number, acceptLanguageHeader?: string) => string;

    beforeAll(() => {
      format = localizeTimestamp({
        defaultLanguage: 'en',
        supportedLanguages: [],
      }).format;
    });

    it('returns the empty string if called without arguments', () => {
      expect(format()).toStrictEqual('');
    });

    it('returns the default language if called without an Accept-Language header', () => {
      expect(format(Date.now() - 1)).toEqual('a few seconds ago');
    });

    it('returns the default language if called with an unsupported language', () => {
      expect(format(Date.now() - 1, 'ru')).toEqual('a few seconds ago');
    });
  });
});
