/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SurveyTargeter from 'lib/survey-targeter';
import { assert } from 'chai';
import sinon from 'sinon';

import NullStorage from 'lib/null-storage';

const sandbox = sinon.createSandbox();
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
      rate: 1,
      url: 'https://www.surveygizmo.com/s3/5541940/pizza',
    },
    {
      conditions: { browser: 'Firefox' },
      rate: 1,
      view: 'settings',
      url: 'https://www.surveygizmo.com/s3/5541940/pizza',
    },
  ];
  const relier = { get: nullFn };
  const options = {
    window: {
      localStorage: new NullStorage(),
      navigator: {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:76.0) Gecko/20100101 Firefox/76.0',
      },
    },
    relier,
    config,
    surveys,
  };

  const newSurveyTargeter = (opts = options) =>
    (surveyTargeter = new SurveyTargeter(opts));

  beforeEach(() => {
    sandbox.resetHistory();
    sandbox.restore();
    newSurveyTargeter(options);
  });

  it('constructs view name to surveys map on instantiation', () => {
    const abc = [{ view: 'abc' }, { view: 'abc' }];
    const xyz = [{ view: 'xyz' }, { view: 'xyz' }];
    const surveys = [...abc, ...xyz];
    newSurveyTargeter({ ...options, surveys });
    assert.deepEqual(surveyTargeter._surveysByViewNameMap, { abc, xyz });
  });

  it('returns a survey if the view matches', async () => {
    const view = await surveyTargeter.getSurvey('settings');
    view.render();
    assert.equal(view.el.className, 'survey-wrapped');
    assert.equal(
      view.$('iframe').first().attr('src'),
      'https://www.surveygizmo.com/s3/5541940/pizza'
    );
  });

  it('returns false if view does not match', async () => {
    const view = await surveyTargeter.getSurvey('non-view');
    assert.isFalse(view);
  });

  it('returns false when no survey qualifies', async () => {
    const surveys = [
      {
        conditions: { relier: 'Boring, Oregon' },
        rate: 1,
        view: 'settings',
      },
      {
        conditions: { browser: 'Dull, Perth and Kinross' },
        rate: 1,
        view: 'settings',
      },
    ];
    newSurveyTargeter({ ...options, surveys });
    const actual = await surveyTargeter.getSurvey('settings');
    assert.isFalse(actual);
  });

  it('selects a survey with _selectSurvey', async () => {
    const spy = sandbox.spy(surveyTargeter, '_selectSurvey');
    await surveyTargeter.getSurvey('settings');
    assert.isTrue(spy.calledOnce);
    assert.isTrue(surveys.includes(spy.firstCall.returnValue));
  });

  it('sets "lastSurvey" in localStorage if view returns', async () => {
    const setItemSpy = sandbox.spy(surveyTargeter._storage, 'set');
    await surveyTargeter.getSurvey('settings');
    const lastSurveyValue = surveyTargeter._storage.get('lastSurvey');

    assert(setItemSpy.calledOnce);
    assert.deepEqual(setItemSpy.args[0], ['lastSurvey', lastSurveyValue]);
  });
});
