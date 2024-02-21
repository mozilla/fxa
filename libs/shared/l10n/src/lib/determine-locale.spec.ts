/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { determineLocale, getLocaleFromRequest } from './determine-locale';

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
    expect(determineLocale('xyz, fr;q=0.9, en-GB, en;q=0.5')).toEqual('en-GB');
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
      expect(getLocaleFromRequest({}, null)).toEqual('en-US');
    });
  });
});
