/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Experiment from 'lib/experiments/grouping-rules/communication-prefs';

describe('lib/experiments/grouping-rules/communication-prefs', () => {
  let experiment;

  before(() => {
    experiment = new Experiment();
  });

  it('choose returns false without subject.lang', () => {
    assert.isFalse(experiment.choose({}));
  });

  [
    'de',
    'de-AT',
    'de-DE',
    'en',
    'en-CA',
    'en-US',
    'en-GB',
    'es',
    'es-ES',
    'es-MX',
    'fr',
    'fr-CA',
    'fr-CH',
    'fr-FR',
    'hu',
    'id',
    'pl',
    'pt-BR',
    'ru',
    'ru-MO',
    'zh-TW',
  ].forEach((lang) => {
    it(`choose returns true for ${lang}`, () => {
      assert.isTrue(experiment.choose({ lang }));
    });
  });

  ['pt', 'pt-PT', 'zh'].forEach((lang) => {
    it(`choose returns false for ${lang}`, () => {
      assert.isFalse(experiment.choose({ lang }));
    });
  });

  it('choose gives precedence to featureFlags', () => {
    assert.isFalse(
      experiment.choose({
        featureFlags: {
          communicationPrefLanguages: ['en', 'fr'],
        },
        lang: 'de',
      })
    );
    assert.isTrue(
      experiment.choose({
        featureFlags: {
          communicationPrefLanguages: ['en', 'pt'],
        },
        lang: 'pt',
      })
    );
  });
});
