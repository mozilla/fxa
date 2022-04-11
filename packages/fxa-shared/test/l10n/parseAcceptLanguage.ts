/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from 'chai';
import { parseAcceptLanguage } from '../../l10n/parseAcceptLanguage';

describe('l10n/parseAcceptLanguage:', () => {
  it('returns default', () => {
    expect(parseAcceptLanguage('en')).to.deep.equal(['en']);
  });

  it('handles unknown', () => {
    expect(parseAcceptLanguage('xyz')).to.deep.equal(['en']);
  });

  it('parses single', () => {
    expect(parseAcceptLanguage('en')).to.deep.equal(['en']);
  });

  it('always contains default language (en)', () => {
    expect(parseAcceptLanguage('es')).to.deep.equal(['es', 'en']);
  });

  it('handles region', () => {
    expect(parseAcceptLanguage('es-MX')).to.deep.equal(['es-MX', 'en']);
  });

  it('handles region with incorrect case', () => {
    expect(parseAcceptLanguage('es-mx, ru')).to.deep.equal([
      'es-MX',
      'ru',
      'en',
    ]);
  });

  it('parses several', () => {
    expect(parseAcceptLanguage('en, de, es, ru')).to.deep.equal([
      'en',
      'de',
      'es',
      'ru',
    ]);
  });

  it('it applies qvalue', () => {
    expect(parseAcceptLanguage('en, de;q=0.1, es, ru;q=0.3')).to.deep.equal([
      'en',
      'es',
      'ru',
      'de',
    ]);
  });
});
