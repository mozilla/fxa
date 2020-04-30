import React from 'react';
import { storiesOf } from '@storybook/react';
import Survey from './index';

const surveyURL = 'https://www.surveygizmo.com/s3/5541940/pizza';

storiesOf('components/Survey', module)
  .add('default', () => (
    <Survey {...{surveyURL}} />
  ))
  .add('complete', () => (
    <Survey {...{surveyURL}} surveyComplete />
  ));
