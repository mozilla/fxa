/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { alertContent, alertType, alertVisible } from '../../../models';
import { AlertBar } from './index';

export default {
  title: 'Components/AlertBar',
  component: AlertBar,
  decorators: [withLocalization],
} as Meta;

export const Success = () => {
  alertContent('This is a success message');
  alertType('success');
  alertVisible(true);
  return <AlertBar />;
};

export const Error = () => {
  alertContent('This is an error message');
  alertType('error');
  alertVisible(true);
  return <AlertBar />;
};

export const Info = () => {
  alertContent('This is an info message');
  alertType('info');
  alertVisible(true);
  return <AlertBar />;
};

export const Warning = () => {
  alertContent('This is a warning message');
  alertType('warning');
  alertVisible(true);
  return <AlertBar />;
};

export const WithLongMessage = () => {
  alertContent(
    'This is a very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long error message'
  );
  alertType('error');
  alertVisible(true);
  return <AlertBar />;
};

export const WithAVeryLongWord = () => {
  alertContent(
    'This is a message with a very long word: supercalifragilisticexpialidocious'
  );
  alertType('error');
  alertVisible(true);
  return <AlertBar />;
};
