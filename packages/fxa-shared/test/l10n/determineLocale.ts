/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from 'chai';
import { determineLocale } from '../../l10n/determineLocale';

describe('l10n/determineLocale:', () => {
  it('finds a locale', () => {
    expect(determineLocale('en')).to.eq('en');
  });

  it('handles undefined locale', () => {
    let s: any = undefined;
    expect(determineLocale(s)).to.eq('en');
  });

  it('handles non-sense langauge', () => {
    expect(determineLocale('wibble')).to.eq('en');
  });

  it('resolves region', () => {
    expect(determineLocale('en-US')).to.eq('en-US');
  });

  it('defaults to base langauge', () => {
    expect(determineLocale('en-XY')).to.eq('en');
  });

  it('resolves base langauge given multiple supported languages with absent region', () => {
    expect(determineLocale('es-MX')).to.eq('es-MX');
  });

  it('ignores case', () => {
    expect(determineLocale('En-uS')).to.eq('en-US');
  });

  it('ignores case and determines correct priority', () => {
    // Technially this shouldn't be supported, but we have some existing
    // tests that support loose case matching on region, so it will be
    // included for backwards compatibility.
    expect(determineLocale('en-US;q=0.1, es-mx; q=0.8')).to.eq('es-MX');
  });

  it('respects q value', () => {
    expect(determineLocale('en-US;q=0.1, es-MX; q=0.8')).to.eq('es-MX');
    expect(determineLocale('en-US;q=.1, es-MX; q=.8')).to.eq('es-MX');
  });

  it('falls back to supported locale', () => {
    // This is an intersting case. en-GB has an implicit q=1, fr has q=0.9, and fr-CH is thrown
    // out because it is not supported. Therefore, en-GB ends up having the highest q value and
    // should be the expected result.
    expect(determineLocale('fr-CH, fr;q=0.9, en-GB, en;q=0.5')).to.eq('en-GB');
  });

  it('handles q-values out of range', () => {
    // The spec says q-values must be between 0 and 1. We will still guard against bad q-values,
    // by forcing them into that range.
    expect(determineLocale('en;q=0.5, fr;q=1.1')).to.eq('fr');
    expect(determineLocale('en;q=0.5, fr;q=-.1')).to.eq('en');
  });
});
