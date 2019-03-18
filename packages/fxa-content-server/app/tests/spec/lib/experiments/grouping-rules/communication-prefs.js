/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const { assert } = require('chai');
  const Experiment = require('lib/experiments/grouping-rules/communication-prefs');

  describe('lib/experiments/grouping-rules/communication-prefs', () => {
    let experiment;

    before(() => {
      experiment = new Experiment();
    });


    it('has the expected number of available languages', () => {
      assert.lengthOf(experiment.availableLanguages, 12);
    });

    describe('choose', () => {
      it('returns false without subject.lang', () => {
        assert.isFalse(experiment.choose({}));
      });

      it('returns true for available languages', () => {
        [
          'de',
          'en',
          'en-US',
          'en-GB',
          'es',
          'es-ES',
          'es-MX',
          'fr',
          'hu',
          'id',
          'pl',
          'pt-br',
          'ru',
          'zh-TW',
        ].forEach((lang) => {
          assert.isTrue(experiment.choose({ lang }));
        });
      });

      it('returns false for unsupported languages', () => {
        [
          'de-DE',
          'pt',
        ].forEach((lang) => {
          assert.isFalse(experiment.choose({ lang }));
        });
      });
    });
  });
});
