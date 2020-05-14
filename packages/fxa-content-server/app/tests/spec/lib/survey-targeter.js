/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SurveyTargeter from 'lib/survey-targeter';
import { assert } from 'chai';

function storageMock() {
  const storage = {};

  return {
    setItem: function(key, value) {
      storage[key] = value || '';
    },
    getItem: function(key) {
      return key in storage ? storage[key] : null;
    },
    removeItem: function(key) {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: function(i) {
      const keys = Object.keys(storage);
      return keys[i] || null;
    }
  };
};

describe('lib/SurveyTargeter', () => {
  let surveyTargeter;

  beforeEach(() => {
    surveyTargeter = new SurveyTargeter({
      surveys: [
        {
          id: 'portugese-speaking-mobile-users-in-southern-hemisphere',
          conditions: {},
          view: 'settings',
          rate: 0.1,
          url: 'https://www.surveygizmo.com/s3/5541940/pizza',
        },
      ],
      window: {localStorage: storageMock()}
    });
  });

  it('surveyTargeter declares a surveyMap on initialization', () => {
    assert.isDefined(surveyTargeter.surveyMap);
  });

  it('surveyTargeter returns a survey if the view matches', () => {
    assert.isDefined(surveyTargeter.getSurvey('settings'));
  });

  it('surveyTargeter sets "lastSurvey" in localStorage if view returns', () => {
    assert.isDefined(surveyTargeter.getSurvey('settings'));
    assert.isDefined(surveyTargeter._storage.get('lastSurvey'));
  });

  it('surveyTargeter returns undefined if view does not match', () => {
    assert.isFalse(surveyTargeter.getSurvey('non-view'));
  });
});
