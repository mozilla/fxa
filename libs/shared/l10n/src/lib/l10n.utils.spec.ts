/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import supportedLanguages from './supported-languages.json';
import {
  determineDirection,
  determineLocale,
  getLocaleFromRequest,
  localizeTimestamp,
  parseAcceptLanguage,
} from './l10n.utils';

describe('l10n.utils', () => {
  describe('l10n/supportedLanguages:', () => {
    it('returns an array of languages', () => {
      expect(Array.isArray(supportedLanguages)).toBe(true);
      expect(supportedLanguages.length).toBeGreaterThan(0);
    });

    it('includes some common languages', () => {
      expect(supportedLanguages.indexOf('de')).toBeGreaterThanOrEqual(0);
      expect(supportedLanguages.indexOf('en')).toBeGreaterThanOrEqual(0);
      expect(supportedLanguages.indexOf('es')).toBeGreaterThanOrEqual(0);
      expect(supportedLanguages.indexOf('fr')).toBeGreaterThanOrEqual(0);
      expect(supportedLanguages.indexOf('pt')).toBeGreaterThanOrEqual(0);
    });
  });

  describe('l10n/parseAcceptLanguage:', () => {
    it('returns default', () => {
      expect(parseAcceptLanguage('en')).toEqual([
        'en',
        'en-US',
        'en-GB',
        'en-CA',
      ]);
    });

    it('handles empty case', () => {
      expect(parseAcceptLanguage('')).toEqual(['en']);
    });

    it('handles undefined', () => {
      expect(parseAcceptLanguage()).toEqual(['en']);
    });

    it('handles null', () => {
      expect(parseAcceptLanguage(null)).toEqual(['en']);
    });

    it('handles unknown', () => {
      expect(parseAcceptLanguage('xyz')).toEqual(['en']);
    });

    it('parses single and always contains default language (en)', () => {
      expect(parseAcceptLanguage('it')).toEqual(['it', 'en']);
    });

    it('parses several with expected output', () => {
      expect(parseAcceptLanguage('en, de, es, ru')).toEqual([
        'en',
        'en-US',
        'en-GB',
        'en-CA',
        'de',
        'es',
        'es-ES',
        'es-AR',
        'es-CL',
        'es-MX',
        'ru',
      ]);
    });

    describe('qvalue', () => {
      it('applies correctly with an implicit and explicit value', () => {
        expect(parseAcceptLanguage('ru;q=0.3, it')).toEqual(['it', 'ru', 'en']);
      });

      it('applies correctly with multiple explicit and implicit values', () => {
        expect(parseAcceptLanguage('de, it;q=0.8, en;q=0.5, es;q=1.0')).toEqual(
          [
            'de',
            'es',
            'es-ES',
            'es-AR',
            'es-CL',
            'es-MX',
            'it',
            'en',
            'en-US',
            'en-GB',
            'en-CA',
          ]
        );
      });

      it('applies correctly with dialects', () => {
        expect(parseAcceptLanguage('de-DE, en-US;q=0.7, en;q=0.3')).toEqual([
          'de',
          'en-US',
          'en',
          'en-GB',
          'en-CA',
        ]);
      });
    });

    describe('dialect (region) options', () => {
      it('handles en-*', () => {
        expect(parseAcceptLanguage('en-CA')).toEqual([
          'en-CA',
          'en',
          'en-US',
          'en-GB',
        ]);
      });

      it('includes all options and always contains default language (en)', () => {
        expect(parseAcceptLanguage('es')).toEqual([
          'es',
          'es-ES',
          'es-AR',
          'es-CL',
          'es-MX',
          'en',
        ]);
      });

      it('handles region with incorrect case', () => {
        expect(parseAcceptLanguage('es-mx, ru')).toEqual([
          'es-MX',
          'es',
          'es-ES',
          'es-AR',
          'es-CL',
          'ru',
          'en',
        ]);
      });

      it('gives "en" higher priority than second locale when first locale is en-*', () => {
        expect(parseAcceptLanguage('en-US, de')).toEqual([
          'en-US',
          'en',
          'en-GB',
          'en-CA',
          'de',
        ]);
      });

      it('handles alias to en-GB', () => {
        expect(parseAcceptLanguage('en-NZ')).toEqual([
          'en-GB',
          'en',
          'en-US',
          'en-CA',
        ]);
      });

      it('handles multiple languages with en-GB alias', () => {
        expect(parseAcceptLanguage('en-NZ, en-GB, en-MY')).toEqual([
          'en-GB',
          'en',
          'en-US',
          'en-CA',
        ]);
      });

      it('falls back to root language if dialect is missing', () => {
        expect(parseAcceptLanguage('fr-FR')).toEqual(['fr', 'en']);
      });

      it('handles Chinese dialects properly', () => {
        expect(parseAcceptLanguage('zh-CN, zh-TW, zh-HK, zh')).toEqual([
          'zh-CN',
          'zh-TW',
          'en',
        ]);
      });
    });

    describe('overrideLocale', () => {
      it('returns the overrideLocale first', () => {
        expect(parseAcceptLanguage('it, ru;q=0.3', undefined, 'de')).toEqual([
          'de',
          'it',
          'ru',
          'en',
        ]);
      });

      it('returns only one instance of locale if overrideLocale is duplicated in acceptLanguage', () => {
        expect(parseAcceptLanguage('it, de;q=0.3', undefined, 'de')).toEqual([
          'de',
          'it',
          'en',
        ]);
      });
    });
  });

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
        expect(format(Date.now() - 1, 'es-mx, ru')).toEqual(
          'hace unos segundos'
        );
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

  describe('l10n/determineLocale:', () => {
    it('finds a locale', () => {
      expect(determineLocale('en')).toEqual('en');
    });

    it('handles undefined locale', () => {
      const s: any = undefined;
      expect(determineLocale(s)).toEqual('en');
    });

    it('handles non-sense langauge', () => {
      expect(determineLocale('wibble')).toEqual('en');
    });

    it('resolves region', () => {
      expect(determineLocale('en-US')).toEqual('en-US');
    });

    it('defaults to base langauge', () => {
      expect(determineLocale('en-XY')).toEqual('en');
    });

    it('resolves base langauge given multiple supported languages with absent region', () => {
      expect(determineLocale('es-MX')).toEqual('es-MX');
    });

    it('ignores case', () => {
      expect(determineLocale('En-uS')).toEqual('en-US');
    });

    it('ignores case and determines correct priority', () => {
      // Technially this shouldn't be supported, but we have some existing
      // tests that support loose case matching on region, so it will be
      // included for backwards compatibility.
      expect(determineLocale('en-US;q=0.1, es-mx; q=0.8')).toEqual('es-MX');
    });

    it('respects q value', () => {
      expect(determineLocale('en-US;q=0.1, es-MX; q=0.8')).toEqual('es-MX');
      expect(determineLocale('en-US;q=.1, es-MX; q=.8')).toEqual('es-MX');
    });

    it('falls back to supported locale with unsupported locale', () => {
      // en-GB has an implicit q=1, fr has q=0.9, and xyz is thrown out because it is
      // not supported. Therefore, en-GB ends up having the highest q value and
      // should be the expected result.
      expect(determineLocale('xyz, fr;q=0.9, en-GB, en;q=0.5')).toEqual(
        'en-GB'
      );
    });

    it('handles q-values out of range', () => {
      // The spec says q-values must be between 0 and 1. We will still guard against bad q-values,
      // by forcing them into that range.
      expect(determineLocale('en;q=0.5, fr;q=1.1')).toEqual('fr');
      expect(determineLocale('en;q=0.5, fr;q=-.1')).toEqual('en');
    });

    describe('getLocaleFromRequest', () => {
      it('return searchParams', () => {
        expect(getLocaleFromRequest({ locale: 'fr-FR' }, null)).toEqual('fr');
      });

      it('return searchParams in supportedLanguages', () => {
        expect(
          getLocaleFromRequest({ locale: 'ra-ND' }, null, ['ra-ND'])
        ).toEqual('ra-ND');
      });

      it('return accept language', () => {
        expect(getLocaleFromRequest({}, 'en-US;q=0.1, es-MX;q=0.8')).toEqual(
          'es-MX'
        );
      });

      it('return default locale', () => {
        expect(getLocaleFromRequest({}, null)).toEqual('en');
      });
    });
  });

  describe('l10n/determineDirection:', () => {
    it('defaults to ltr for undefined locale', () => {
      const s: any = undefined;
      expect(determineDirection(s)).toEqual('ltr');
    });

    it('defaults to ltr for non-sense langauge', () => {
      expect(determineDirection('wibble')).toEqual('ltr');
    });

    it('resolves to ltr for a selection of ltr languages', () => {
      expect(determineDirection('fr')).toEqual('ltr');
      expect(determineDirection('de')).toEqual('ltr');
      expect(determineDirection('zh')).toEqual('ltr');
    });

    // arabic is not currently supported, and strings will be displayed in English
    // direction must be LTR for English even if requested locale is arabic
    it('resolves to ltr for unspported ltr language', () => {
      expect(determineDirection('ar')).toEqual('ltr');
    });

    it('resolves to rtl for hebrew', () => {
      expect(determineDirection('he')).toEqual('rtl');
    });

    it('it ignores case and resovles to rtl for hebrew', () => {
      expect(determineDirection('he-il')).toEqual('rtl');
      expect(determineDirection('he-IL')).toEqual('rtl');
    });
  });
});
