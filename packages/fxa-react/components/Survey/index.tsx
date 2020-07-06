/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';

type SurveyProps = {
  surveyURL: string;
  surveyComplete?: boolean;
  onSurveyClose: Function;
  className?: string;
};

/*
 - fix index.scss import, FXA-2237
 - test import in payments server
 - translations will need to wait until after settings work is underway,
then we should be able to use the same fluent syntax in content and
payment servers
*/

export const CreateHandleIframeTask = (
  callback: Function,
  evtMessage: string = 'survey complete'
) => {
  // https://github.com/mozilla/fxa/blob/26224fe8a315d8e9949a577485f9184f47e978c7/packages/fxa-payments-server/src/routes/Product/SubscriptionRedirect/index.tsx#L34
  const handleIframeTask = (evt: MessageEvent) => {
    // Note: This event is implemented in code within the SurveyGizmo iframe embed.
    // https://help.surveygizmo.com/help/adding-javascript-to-your-survey
    if (evt.data === evtMessage) callback();
  };
  return handleIframeTask;
};

export const Survey = ({
  surveyURL,
  surveyComplete = false,
  onSurveyClose,
  className = '',
}: SurveyProps) => {
  const [inProp, setInProp] = useState(false);
  const emoji = `✅ 👍 💖`;

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
      {/*
        * The header/desc IDs typically provided to the `aria-labelledby` and
        * `aria-describedby` attributes for screenreader context are dynamic in SurveyGizmo.
        * The `aria-label` provides generic survey context and the title of the survey in
        * SG is read when the user hits the iframe which provides more specific context.
      */}
      <aside
        className={classNames('survey-component', className)}
        data-testid="survey-component"
        aria-label="Firefox accounts optional user survey"
      >
        <button
          className="survey-close"
          title="Close"
          data-testid="survey-close"
          onClick={onSurveyClose as () => void}
        ></button>
        {surveyComplete ? surveyCompleteElement : iframe}
      </aside>
    </CSSTransition>
  );
};

export default Survey;
