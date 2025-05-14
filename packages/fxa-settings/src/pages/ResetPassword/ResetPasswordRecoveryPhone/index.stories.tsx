/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Subject } from './mocks';
import ResetPasswordRecoveryPhone from '.';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { HandledError } from '../../../lib/error-utils';

export default {
  title: 'Pages/ResetPassword/ResetPasswordRecoveryPhone',
  component: ResetPasswordRecoveryPhone,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => (
  <Subject
    verifyCode={(code: string) => {
      action('verifyCode')(code);
      return Promise.resolve();
    }}
  />
);

export const WithCodeErrorOnSubmit = () => (
  <Subject
    verifyCode={(code: string) =>
      Promise.resolve(AuthUiErrors.INVALID_EXPIRED_OTP_CODE as HandledError)
    }
    resendCode={() => Promise.resolve()}
  />
);

export const WithGeneralErrorMessages = () => (
  <Subject
    verifyCode={(code: string) =>
      Promise.resolve(AuthUiErrors.BACKEND_SERVICE_FAILURE as HandledError)
    }
    resendCode={() =>
      Promise.resolve(AuthUiErrors.BACKEND_SERVICE_FAILURE as HandledError)
    }
  />
);

export const WithThrottlingErrorMessages = () => (
  <Subject
    verifyCode={(code: string) =>
      Promise.resolve(AuthUiErrors.THROTTLED as HandledError)
    }
    resendCode={() => Promise.resolve(AuthUiErrors.THROTTLED as HandledError)}
  />
);
