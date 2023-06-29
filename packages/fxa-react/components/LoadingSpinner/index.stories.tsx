import React from 'react';
import { storiesOf } from '@storybook/react';
import LoadingSpinner, { SpinnerType } from './index';
import { withLocalization } from '../../lib/storybooks';

storiesOf('Components/LoadingSpinner', module)
  .add('default', () => withLocalization(() => <LoadingSpinner />))
  .add('blue', () =>
    withLocalization(() => <LoadingSpinner spinnerType={SpinnerType.Blue} />)
  )
  .add('white', () =>
    withLocalization(() => (
      <div className="bg-grey-700">
        <LoadingSpinner spinnerType={SpinnerType.White} />
      </div>
    ))
  );
