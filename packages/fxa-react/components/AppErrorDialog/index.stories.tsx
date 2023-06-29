import React from 'react';
import { storiesOf } from '@storybook/react';
import AppErrorDialog from './index';
import { withLocalization } from '../../lib/storybooks';

storiesOf('Components/AppErrorDialog', module).add('basic', () =>
  withLocalization(() => <AppErrorDialog error={new Error('Uh oh!')} />)
);
