/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SurveyTargeter from 'lib/survey-targeter';
import { assert } from 'chai';
import sinon from 'sinon';

import NullStorage from '../../../scripts/lib/null-storage';

const sandbox = sinon.createSandbox();
const trueFn = sandbox.stub().returns(true);
const nullFn = sandbox.stub().returns(null);

describe('lib/SurveyTargeter', () => {
  let surveyTargeter;
  const doNotBotherSpan = 2592000000;
  const config = {
    enabled: true,
    doNotBotherSpan,
  };
  const surveys = [
    {
      id: 'portugese-speaking-mobile-users-in-southern-hemisphere',
      conditions: { relier: null },
      view: 'settings',
      rate: 0.1,
      url: 'https://www.surveygizmo.com/s3/5541940/pizza',
    },
  ];

  beforeEach(() => {
    sandbox.resetHistory();
    sandbox.restore();
    surveyTargeter = new SurveyTargeter({
      window: {
        localStorage: new NullStorage(),
        navigator: {
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:76.0) Gecko/20100101 Firefox/76.0',
        },
      },
      relier: {
        get: nullFn,
      },
      user: {
        getSignedInAccount: trueFn,
      },
      config,
      surveys,
    });
  });

  it('surveyTargeter returns a survey if the view matches', async () => {
    const view = await surveyTargeter.getSurvey('settings');
    assert.equal(view.el.className, 'survey-wrapped');
  });

  it('surveyTargeter sets "lastSurvey" in localStorage if view returns', async () => {
    const setItemSpy = sandbox.spy(surveyTargeter._storage, 'set');
    await surveyTargeter.getSurvey('settings');
    const lastSurveyValue = surveyTargeter._storage.get('lastSurvey');

    assert(setItemSpy.calledOnce);
    assert.deepEqual(setItemSpy.args[0], ['lastSurvey', lastSurveyValue]);
  });

  it('surveyTargeter returns false if view does not match', async () => {
    const view = await surveyTargeter.getSurvey('non-view');
    assert.isFalse(view);
  });

  describe('surveyMap', () => {
    it('should construct the map only once', async () => {
      // since we cannot spy on an ES module (survey-filter), we cheat by spying on something else...
      const reduceSpy = sandbox.spy(surveys, 'reduce');
      const surveyMapSpy = sandbox.spy(surveyTargeter, 'surveyMap');
      await surveyTargeter.getSurvey('settings');
      await surveyTargeter.getSurvey('settings');
      assert.isTrue(reduceSpy.calledOnce);
      assert.isTrue(surveyMapSpy.calledTwice);
    });

    it('should construct the map with view name as key and array as value', async () => {
      // not geat but an easy to get pass the lastSurvey condition so we can have a map
      sandbox
        .stub(surveyTargeter._storage, 'get')
        .returns(Date.now() - doNotBotherSpan * 2);
      const surveyMap = await surveyTargeter.surveyMap();
      assert.isArray(surveyMap['settings']);
      assert.deepEqual(surveyMap['settings'], surveys);
    });
  });
});
