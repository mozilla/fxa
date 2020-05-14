/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SurveyTargeter from 'lib/survey-targeter';
import { assert } from 'chai';

describe('lib/SurveyTargeter', () => {
  let surveyTargeter;

  beforeEach(() => {
    surveyTargeter = new SurveyTargeter({
      surveys: [{
        id: 'portugese-speaking-mobile-users-in-southern-hemisphere',
        conditions: {},
        view: 'settings',
        rate: 0.1,
        url: 'https://www.surveygizmo.com/s3/5541940/pizza',
      }]
    });
  });

  it('surveyTargeter declares a surveyMap on initialization', () => {
    assert.isDefined(surveyTargeter.surveyMap);
  });

  it('surveyTargeter returns a survey if the view matches', () => {
    assert.isDefined(surveyTargeter.getSurvey('settings'));
  });

  it('surveyTargeter returns undefined if view does not match', () => {
    assert.isUndefined(surveyTargeter.getSurvey('non-view'));
  });
});
