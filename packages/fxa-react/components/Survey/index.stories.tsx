import React, { useState, useCallback } from 'react';
import { storiesOf } from '@storybook/react';
import Survey from '.';
import './index.scss';

const surveyURL = 'https://www.surveygizmo.com/s3/5541940/pizza';

storiesOf('Components|Survey', module)
  .add('default', () => {
    const [showSurvey, setShowSurvey] = useState(true);

    const onSurveyClose = useCallback(() => {
      setShowSurvey(false);
    }, [setShowSurvey]);

    return <>{showSurvey && <Survey {...{ surveyURL, onSurveyClose }} />}</>;
  })
  .add('complete', () => {
    const [showSurvey, setShowSurvey] = useState(true);

    const onSurveyClose = useCallback(() => {
      setShowSurvey(false);
    }, [setShowSurvey]);

    return (
      <>
        {showSurvey && (
          <Survey
            className="storybook"
            {...{ surveyURL, onSurveyClose }}
            surveyComplete
          />
        )}
      </>
    );
  });
