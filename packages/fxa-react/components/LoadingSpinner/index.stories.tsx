import React from 'react';
import { storiesOf } from '@storybook/react';
import LoadingSpinner, { SpinnerType } from './index';

storiesOf('Components/LoadingSpinner', module)
  .add('default', () => <LoadingSpinner />)
  .add('blue', () => <LoadingSpinner spinnerType={SpinnerType.Blue} />)
  .add('white', () => (
    <div className="bg-grey-700">
      <LoadingSpinner spinnerType={SpinnerType.White} />
    </div>
  ));
