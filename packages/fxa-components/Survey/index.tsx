/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { CSSTransition } from 'react-transition-group';

// import './index.scss';

type SurveyProps = {
  surveyURL: string;
  surveyComplete?: boolean;
};

/*
 - test import in payments server
 - translations will need to wait until after settings work is underway,
then we should be able to use the same fluent syntax in content and
payment servers
*/

export const CreateHandleIframeTask = (callback: Function) => {
  // https://github.com/mozilla/fxa/blob/26224fe8a315d8e9949a577485f9184f47e978c7/packages/fxa-payments-server/src/routes/Product/SubscriptionRedirect/index.tsx#L34
  const handleIframeTask = (evt: MessageEvent) => {
    // Note: This event is implemented in code within the SurveyGizmo iframe embed.
    // https://help.surveygizmo.com/help/adding-javascript-to-your-survey
    if (evt.data === 'submitted survey') callback();
  };
  return handleIframeTask;
};

export const Survey = ({ surveyURL, surveyComplete = false }: SurveyProps) => {
  const [inProp, setInProp] = useState(false);
  const emoji = `✅&nbsp;👍&nbsp;💖`;

  const surveyCompleteElement = (
    <div className="survey-complete-msg" data-testid="survey-complete-msg">
      <p className="emoji">{emoji}</p>
      <p>Thank you for your input.</p>
      <p className="small">This survey will close automatically.</p>
    </div>
  );

  const iframe = (
    <iframe
      className="survey-iframe"
      src={surveyURL}
      frameBorder="0"
      onLoad={() => setInProp(true)}
      width="320"
      height="360"
      data-testid="survey-iframe"
    ></iframe>
  );

  return (
    <CSSTransition in={inProp} timeout={200} classNames="survey-inner">
      <section
        className="survey-component"
        data-testid="survey-component"
        aria-hidden="true"
      >
        <CSSTransition in={inProp} timeout={100} classNames="button-inner">
          <button
            className="survey-control"
            onClick={() => setInProp(!inProp)}
          ></button>
        </CSSTransition>
        {surveyComplete ? surveyCompleteElement : iframe}
      </section>
    </CSSTransition>
  );
};

export default Survey;
