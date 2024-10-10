/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import AppLayout from '../../../components/AppLayout';
import { ResetPasswordConfirmedProps } from './interfaces';
import {
  CheckmarkCircleFullIcon,
  PasswordSuccessImage,
} from '../../../components/images';
import { FtlMsg } from 'fxa-react/lib/utils';
import Banner, { BannerType } from '../../../components/Banner';

const ResetPasswordConfirmed = ({
  continueHandler,
  errorMessage,
  serviceName,
}: ResetPasswordConfirmedProps & RouteComponentProps) => {
  return (
    <AppLayout>
      {errorMessage && (
        <Banner type={BannerType.error} additionalClassNames="mb-6">
          {errorMessage}
        </Banner>
      )}
      <div className="flex items-top justify-center">
        <CheckmarkCircleFullIcon className="shrink-0 me-4" />
        <FtlMsg id="reset-password-complete-header">
          <h1 className="card-header -mt-1">Your password has been reset</h1>
        </FtlMsg>
      </div>
      <PasswordSuccessImage className="mt-4 mb-8 mx-auto" />
      <FtlMsg id="reset-password-confirmed-cta" vars={{ serviceName }}>
        <button
          className="cta-primary cta-xl w-full"
          type="button"
          data-glean-id="password_reset_success_continue_to_relying_party_submit"
          onClick={() => continueHandler()}
        >{`Continue to ${serviceName}`}</button>
      </FtlMsg>
    </AppLayout>
  );
};

export default ResetPasswordConfirmed;
