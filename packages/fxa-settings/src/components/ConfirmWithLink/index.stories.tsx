/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmWithLink from '.';
import { Meta } from '@storybook/react';
import {
  SubjectWithEmailResendError,
  SubjectWithEmailResendSuccess,
  SubjectCanGoBack,
  MOCK_GOBACK_CB,
} from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/ConfirmWithLink',
  component: ConfirmWithLink,
  decorators: [withLocalization],
} as Meta;

export const ResendSuccess = () => <SubjectWithEmailResendSuccess />;

export const ResendError = () => <SubjectWithEmailResendError />;

export const UserCanGoBack = () => (
  <SubjectCanGoBack navigateBackHandler={MOCK_GOBACK_CB} />
);
