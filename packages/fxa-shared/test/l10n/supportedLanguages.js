/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

describe('l10n/supportedLanguages:', () => {
  let supportedLanguages;

  before(() => {
    supportedLanguages = require('../../l10n/supportedLanguages.json');
  });

  it('returns an array of languages', () => {
    assert.isArray(supportedLanguages);
    assert.isAbove(supportedLanguages.length, 0);
  });

  it('includes some common languages', () => {
    assert.isAtLeast(supportedLanguages.indexOf('de'), 0);
    assert.isAtLeast(supportedLanguages.indexOf('en'), 0);
    assert.isAtLeast(supportedLanguages.indexOf('es'), 0);
    assert.isAtLeast(supportedLanguages.indexOf('fr'), 0);
    assert.isAtLeast(supportedLanguages.indexOf('pt'), 0);
  });
});
