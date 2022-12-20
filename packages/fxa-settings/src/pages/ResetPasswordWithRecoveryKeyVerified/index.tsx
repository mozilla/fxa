/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { logViewEvent } from '../../lib/metrics';
import Ready from '../../components/Ready';

type ResetPasswordWithRecoveryKeyVerifiedProps = {
  serviceName?: string;
};

const ResetPasswordWithRecoveryKeyVerified = ({
  serviceName,
}: ResetPasswordWithRecoveryKeyVerifiedProps & RouteComponentProps) => {
  const navigate = useNavigate();
  const viewName = 'reset-password-with-recovery-key-verified';

  return (
    <>
      <Ready {...{ viewName, serviceName }} />
      <div className="flex justify-center mx-auto m-6">
        <button
          className="cta-primary cta-xl"
          onClick={() => {
            const eventName = `${viewName}.generate-new-key`;
            logViewEvent(viewName, eventName, {
              entrypoint_variation: 'react',
            });
            navigate('/settings/account_recovery');
          }}
        >
          <FtlMsg id="reset-password-with-recovery-key-verified-generate-new-key">
            Generate a new account recovery key
          </FtlMsg>
        </button>
      </div>
      <button
        className="link-blue text-sm"
        onClick={() => {
          const eventName = `${viewName}.continue-to-account`;
          logViewEvent(viewName, eventName, {
            entrypoint_variation: 'react',
          });
          navigate('/settings');
        }}
      >
        <FtlMsg id="reset-password-with-recovery-key-verified-continue-to-account">
          Continue to my account
        </FtlMsg>
      </button>
    </>
  );
};

export default ResetPasswordWithRecoveryKeyVerified;
