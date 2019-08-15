/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const config = require(`${ROOT_DIR}/config/index`).getProperties();
const error = require(`${ROOT_DIR}/lib/error`);
const mocks = require('../mocks');

const log = mocks.mockLog();

describe('mailer locales', () => {
  let mailer;
  before(() => {
    return require(`${ROOT_DIR}/lib/senders/translator`)(
      config.i18n.supportedLanguages,
      config.i18n.defaultLanguage
    )
      .then(translator => {
        return require(`${ROOT_DIR}/lib/senders`)(
          log,
          config,
          error,
          translator
        );
      })
      .then(result => {
        mailer = result.email;
      });
  });

  it('All configured supportedLanguages are available', () => {
    const locales = config.i18n.supportedLanguages;
    locales.forEach(lang => {
      // sr-LATN is sr, but in Latin characters, not Cyrillic
      if (lang === 'sr-LATN') {
        assert.equal('sr-Latn', mailer.translator(lang).language);
      } else {
        assert.equal(lang, mailer.translator(lang).language);
      }
    });
  });

  it('unsupported languages get default/fallback content', () => {
    // These are locales for which we do not have explicit translations
    const locales = [
      // [ locale, expected result ]
      ['', 'en'],
      ['en-US', 'en'],
      ['en-CA', 'en'],
      ['db-LB', 'en'],
      ['el-GR', 'en'],
      ['es-BO', 'es'],
      ['fr-FR', 'fr'],
      ['fr-CA', 'fr'],
    ];

    locales.forEach(lang => {
      assert.equal(lang[1], mailer.translator(lang[0]).language);
    });
  });

  it('accept-language handled correctly', () => {
    // These are the Accept-Language headers from Firefox 37 L10N builds
    const locales = [
      // [ accept-language, expected result ]
      ['bogus-value', 'en'],
      ['en-US,en;q=0.5', 'en'],
      ['es-AR,es;q=0.8,en-US;q=0.5,en;q=0.3', 'es-AR'],
      ['es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3', 'es-ES'],
      ['sv-SE,sv;q=0.8,en-US;q=0.5,en;q=0.3', 'sv-SE'],
      ['zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3', 'zh-CN'],
    ];

    locales.forEach(lang => {
      assert.equal(lang[1], mailer.translator(lang[0]).language);
    });
  });

  after(() => mailer.stop());
});
