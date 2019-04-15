/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

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
    it(`choose returns true for ${lang}`, () => {
      assert.isTrue(experiment.choose({ lang }));
    });
  });

  [
    'de-DE',
    'pt',
  ].forEach((lang) => {
    it(`choose returns false for ${lang}`, () => {
      assert.isFalse(experiment.choose({ lang }));
    });
  });

  it('choose gives precedence to featureFlags', () => {
    assert.isFalse(experiment.choose({
      featureFlags: {
        communicationPrefLanguages: [ 'en', 'fr' ]
      },
      lang: 'de'
    }));
    assert.isTrue(experiment.choose({
      featureFlags: {
        communicationPrefLanguages: [ 'en', 'pt' ]
      },
      lang: 'pt'
    }));
  });
});
