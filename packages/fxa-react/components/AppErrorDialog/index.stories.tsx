import React from 'react';
import { storiesOf } from '@storybook/react';
import AppErrorDialog from './index';

storiesOf('Components|AppErrorDialog', module).add('basic', () => (
  <AppErrorDialog error={new Error('Uh oh!')} />
));
