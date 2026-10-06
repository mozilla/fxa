/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ForcePasswordChange from '.';
import { Subject } from './mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { HandledError } from '../../../lib/error-utils';

export default {
  title: 'Pages/PostVerify/ForcePasswordChange',
  component: ForcePasswordChange,
  decorators: [withLocalization],
} as Meta;

export const Default = () => <Subject />;

export const WithIncorrectPasswordError = () => (
  <Subject
    changePasswordHandler={() =>
      Promise.resolve({
        error: AuthUiErrors.INCORRECT_PASSWORD as HandledError,
      })
    }
  />
);
