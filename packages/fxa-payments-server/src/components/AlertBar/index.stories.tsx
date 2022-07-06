import React from 'react';
import { storiesOf } from '@storybook/react';
import { AlertBar } from './index';

storiesOf('components/AlertBar', module).add('basic', () => (
  <AlertBar
    className="alert"
    dataTestId="alert-bar"
    headerId="alert-bar-header"
    localizedId="alert-bar"
  >
    This is an alert.
  </AlertBar>
));
