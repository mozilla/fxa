/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

require('../../../lib/senders/translator')(
  ['en', 'pt_br', 'DE', 'ES_AR', 'ES_cl'],
  'en'
).then(translator => {
  it('returns the correct interface', () => {
    assert.equal(typeof translator, 'object');
    assert.equal(Object.keys(translator).length, 2);
    assert.equal(typeof translator.getTranslator, 'function');
    assert.equal(typeof translator.getLocale, 'function');
  });

  it('getTranslator works with upper and lowercase languages', () => {
    let x = translator.getTranslator('PT-br,DE');
    assert.equal(x.language, 'pt-BR');
    x = translator.getTranslator('bu-ll,es-ar');
    assert.equal(x.language, 'es-AR');
    x = translator.getTranslator('es-CL');
    assert.equal(x.language, 'es-CL');
    x = translator.getTranslator('en-US');
    assert.equal(x.language, 'en');
    x = translator.getTranslator('db-LB'); // a locale that does not exist
    assert.equal(x.language, 'en');
  });

  it('getLocale works with upper and lowercase languages', () => {
    assert.equal(translator.getLocale('PT-br,DE'), 'pt-BR');
    assert.equal(translator.getLocale('bu-ll,es-ar'), 'es-AR');
    assert.equal(translator.getLocale('es-CL'), 'es-CL');
    assert.equal(translator.getLocale('en-US'), 'en');
    assert.equal(translator.getLocale('db-LB'), 'en');
  });
});
