/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint-disable no-unused-vars*/
import React, { useState, useEffect } from 'react';
/*eslint-enable no-unused-vars*/
import ReactDOM from 'react-dom';
import Cocktail from 'cocktail';
import BaseView from './base';
import SettingsPanelMixin from './mixins/settings-panel-mixin';

/*eslint-disable no-unused-vars*/
import Survey, { CreateHandleIframeTask } from '@fxa-components/Survey/index.tsx';
/*eslint-enable no-unused-vars*/

/*
config = {
  surveys: [
    {
      id: 'portugese-speaking-mobile-users-in-southern-hemisphere',
      conditions: [{platform: 'mobile', region: 'southernHemisphere', lang: 'pt', relier: 'email'}],
      view: ['settings-home'],
      rate: 0.1,
      url: 'https://www.surveygizmo.com/s3/5541940/portugese-speaking-mobile-users-in-southern-hemisphere'
    }
  ]
}

There will be multiple surveys at times.

Will need to set a date in local or session storage to indicate
the last time a survey was shown to the user. We want to
avoid showing the user more than one survey per month.

*/

/*eslint-disable no-unused-vars*/
const SurveyView = surveyURL => {
  /*eslint-enable no-unused-vars*/
  const [showSurvey, setShowSurvey] = useState(true);
  const [surveyComplete, setSurveyComplete] = useState(false);

  useEffect(() => {
    const handleIframeTask = CreateHandleIframeTask(() => {
      setSurveyComplete(true);
      setTimeout(() => {
        setShowSurvey(false);
      }, 300);
    });
    // here we are listening for the 'survey complete'
    // message from surveygizmo

    // TODO: We aren't receiving a message back from survey gizmo, this may be an issue on localhost
    window.addEventListener('message', handleIframeTask, false);
    return () => window.removeEventListener('message', handleIframeTask);
  }, [setShowSurvey, setSurveyComplete, setTimeout]);

  // TODO: why is surveyURL turning into {surveyURL: ""}?
  return (
    <>
      {showSurvey && (
        <Survey {...{ surveyComplete, surveyURL: surveyURL.surveyURL }} />
      )}
    </>
  );
};

// const isMobile = !useMatchMedia('(min-width: 768px)', matchMediaDefault);
// const lang = navigator.language;

// function checkConditions(conditions) {
//   if (conditions.platform === 'mobile') {
//     if (!isMobile) return false;
//   } else if (isMobile) return false;
//   if (lang !== conditions.platform) return false;
//   // check relier
// }

function checkConditions(conditions) {
  console.log('survey conditions: ', conditions);
  return true;
}

function checkValidSurveys(resolve, reject) {
  // TODO: currently reject prevents the whole page from rendering
  const validSurveys = this.surveys.filter(checkConditions);
  return validSurveys.length ? resolve(validSurveys) : reject();
}

const SurveyWrapperView = BaseView.extend({
  template: () => '<div />',
  className: 'survey-wrapped',

  openPanel() {
    // force a re-render so that the input element is focused.
    return this.render();
  },

  submit() {},

  render() {
    return new Promise(checkValidSurveys.bind(this)).then((surveys) => {
      const surveyURL = surveys[Math.floor((Math.random() * surveys.length))].url;
      ReactDOM.render(<SurveyView {...{ surveyURL }} />, this.$el.get(0));
      return true;
    }).catch(()=> {
      return false;
    });
  },
});

Cocktail.mixin(SurveyWrapperView, SettingsPanelMixin);

export default SurveyWrapperView;
