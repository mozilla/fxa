/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint-disable no-unused-vars*/
import React, { useState, useEffect } from 'react';
/*eslint-enable no-unused-vars*/
import ReactDOM from 'react-dom';
import BaseView from './base';

/*eslint-disable no-unused-vars*/
import Survey, {
  CreateHandleIframeTask,
} from 'fxa-react/components/Survey';
/*eslint-enable no-unused-vars*/

/*eslint-disable no-unused-vars*/
const SurveyView = (props) => {
  const { surveyURL } = props;
  /*eslint-enable no-unused-vars*/
  const [showSurvey, setShowSurvey] = useState(true);
  const [surveyComplete, setSurveyComplete] = useState(false);

  useEffect(() => {
    // here we are listening for the survey complete
    // message from surveygizmo
    const handleIframeTask = CreateHandleIframeTask(() => {
      setSurveyComplete(true);
      setTimeout(() => {
        setShowSurvey(false);
      }, 3000);
    });
    window.addEventListener('message', handleIframeTask, false);
    return () => window.removeEventListener('message', handleIframeTask);
  }, [setShowSurvey, setSurveyComplete, setTimeout]);

  return <>{showSurvey && <Survey {...{ surveyComplete, surveyURL }} />}</>;
};

const SurveyWrapperView = BaseView.extend({
  template: () => '<div />',
  className: 'survey-wrapped',

  initialize(options = {}) {
    this.surveyURL = options.surveyURL;
  },

  render() {
    return ReactDOM.render(
      <SurveyView {...{ surveyURL: this.surveyURL }} />,
      this.el
    );
  },
});

export default SurveyWrapperView;
