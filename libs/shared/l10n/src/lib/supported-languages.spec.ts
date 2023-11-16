/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import supportedLanguages from './supported-languages.json';

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
