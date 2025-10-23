/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import Banner from '../../../components/Banner';
import { CheckmarkCircleFullGreenIcon } from '../../../components/Icons';
import { PasswordSuccessImage } from '../../../components/images';
import { ResetPasswordConfirmedProps } from './interfaces';

const ResetPasswordConfirmed = ({
  continueHandler,
  errorMessage,
  serviceName,
}: ResetPasswordConfirmedProps & RouteComponentProps) => {
  return (
    <AppLayout>
      {errorMessage && (
        <Banner type="error" content={{ localizedHeading: errorMessage }} />
      )}
      <div className="flex items-top justify-center">
        <CheckmarkCircleFullGreenIcon
          className="shrink-0 me-4"
          mode="success"
        />
        <FtlMsg id="reset-password-complete-header">
          <h1 className="card-header -mt-1">Your password has been reset</h1>
        </FtlMsg>
      </div>
      <PasswordSuccessImage />
      <FtlMsg id="reset-password-confirmed-cta" vars={{ serviceName }}>
        <button
          className="cta-primary cta-xl w-full mt-6"
          type="button"
          data-glean-id="password_reset_success_continue_to_relying_party_submit"
          onClick={() => continueHandler()}
        >{`Continue to ${serviceName}`}</button>
      </FtlMsg>
    </AppLayout>
  );
};

export default ResetPasswordConfirmed;
