/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from 'chai';
import { parseAcceptLanguage } from '../../l10n/parseAcceptLanguage';

describe('#unit - l10n/parseAcceptLanguage:', () => {
  it('returns default', () => {
    expect(parseAcceptLanguage('en')).to.deep.equal([
      'en',
      'en-US',
      'en-GB',
      'en-CA',
    ]);
  });

  it('handles empty case', () => {
    expect(parseAcceptLanguage('')).to.deep.equal(['en']);
  });

  it('handles unknown', () => {
    expect(parseAcceptLanguage('xyz')).to.deep.equal(['en']);
  });

  it('parses single and always contains default language (en)', () => {
    expect(parseAcceptLanguage('it')).to.deep.equal(['it', 'en']);
  });

  it('parses several with expected output', () => {
    expect(parseAcceptLanguage('en, de, es, ru')).to.deep.equal([
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
      expect(parseAcceptLanguage('ru;q=0.3, it')).to.deep.equal([
        'it',
        'ru',
        'en',
      ]);
    });

    it('applies correctly with multiple explicit and implicit values', () => {
      expect(
        parseAcceptLanguage('de, it;q=0.8, en;q=0.5, es;q=1.0')
      ).to.deep.equal([
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
      ]);
    });

    it('applies correctly with dialects', () => {
      expect(parseAcceptLanguage('de-DE, en-US;q=0.7, en;q=0.3')).to.deep.equal(
        ['de', 'en-US', 'en', 'en-GB', 'en-CA']
      );
    });
  });

  describe('dialect (region) options', () => {
    it('handles en-*', () => {
      expect(parseAcceptLanguage('en-CA')).to.deep.equal([
        'en-CA',
        'en',
        'en-US',
        'en-GB',
      ]);
    });

    it('includes all options and always contains default language (en)', () => {
      expect(parseAcceptLanguage('es')).to.deep.equal([
        'es',
        'es-ES',
        'es-AR',
        'es-CL',
        'es-MX',
        'en',
      ]);
    });

    it('handles region with incorrect case', () => {
      expect(parseAcceptLanguage('es-mx, ru')).to.deep.equal([
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
      expect(parseAcceptLanguage('en-US, de')).to.deep.equal([
        'en-US',
        'en',
        'en-GB',
        'en-CA',
        'de',
      ]);
    });

    it('handles alias to en-GB', () => {
      expect(parseAcceptLanguage('en-NZ')).to.deep.equal([
        'en-GB',
        'en',
        'en-US',
        'en-CA',
      ]);
    });

    it('handles multiple languages with en-GB alias', () => {
      expect(parseAcceptLanguage('en-NZ, en-GB, en-MY')).to.deep.equal([
        'en-GB',
        'en',
        'en-US',
        'en-CA',
      ]);
    });

    it('falls back to root language if dialect is missing', () => {
      expect(parseAcceptLanguage('fr-FR')).to.deep.equal(['fr', 'en']);
    });

    it('handles Chinese dialects properly', () => {
      expect(parseAcceptLanguage('zh-CN, zh-TW, zh-HK, zh')).to.deep.equal([
        'zh-CN',
        'zh-TW',
        'en',
      ]);
    });
  });
});
