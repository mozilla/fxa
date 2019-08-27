/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import { localizeTimestamp } from '../../l10n/localizeTimestamp';

describe('l10n/localizeTimestamp:', () => {
  describe('call with supported language:', () => {
    let format: any;

    before(() => {
      format = localizeTimestamp({
        defaultLanguage: 'en',
        supportedLanguages: ['ar', 'es', 'ru'],
      }).format;
    });

    it('returns the empty string if called without arguments', () => {
      assert.strictEqual(format(), '');
    });

    it('returns the default language if called without an Accept-Language header', () => {
      assert.equal(format(Date.now() - 1), 'a few seconds ago');
    });

    it('returns the requested language if called with an Accept-Language header', () => {
      assert.equal(
        format(Date.now() - 1, 'ru,en-GB;q=0.5,en;q=0.3'),
        'несколько секунд назад'
      );
    });

    it('returns the requested language if called with a single language', () => {
      assert.equal(format(Date.now() - 1, 'ru'), 'несколько секунд назад');
    });

    it('returns the requested language if called with a language variation', () => {
      assert.equal(format(Date.now() - 1, 'es-mx, ru'), 'hace unos segundos');
    });

    it('returns a fallback language if called with unsupported language variations', () => {
      assert.equal(
        format(Date.now() - 1, 'de, fr;q=0.8, ru;q=0.5'),
        'несколько секунд назад'
      );
    });

    it('returns the default language if called with an unsupported language', () => {
      assert.equal(format(Date.now() - 1, 'qu'), 'a few seconds ago');
    });

    it('returns the default language if called with the default language', () => {
      assert.equal(format(Date.now() - 1, 'en'), 'a few seconds ago');
    });

    it('returns the first supported language if called with the first supported language', () => {
      assert.equal(format(Date.now() - 1, 'ar'), 'منذ ثانية واحدة');
    });
  });

  describe('call with no supported languages:', () => {
    let format: (timestamp?: number, acceptLanguageHeader?: string) => string;

    before(() => {
      format = localizeTimestamp({
        defaultLanguage: 'en',
        supportedLanguages: [],
      }).format;
    });

    it('returns the empty string if called without arguments', () => {
      assert.strictEqual(format(), '');
    });

    it('returns the default language if called without an Accept-Language header', () => {
      assert.equal(format(Date.now() - 1), 'a few seconds ago');
    });

    it('returns the default language if called with an unsupported language', () => {
      assert.equal(format(Date.now() - 1, 'ru'), 'a few seconds ago');
    });
  });
});
