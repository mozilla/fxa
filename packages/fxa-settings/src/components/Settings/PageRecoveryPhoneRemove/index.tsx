/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Link, RouteComponentProps, useNavigate } from '@reach/router';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { SETTINGS_PATH } from '../../../constants';
import CardHeader from '../../CardHeader';
import AppLayout from '../../AppLayout';
import Banner from '../../Banner';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useAccount } from '../../../models';

// TODO, update this link with #section-heading once the SUMO article is updated (FXA-10918)
const sumoTwoStepLink = (
  <LinkExternal
    className="link-blue"
    href="https://support.mozilla.org/en-US/kb/secure-firefox-account-two-step-authentication"
  >
    Compare recovery methods
  </LinkExternal>
);

const PageRecoveryPhoneRemove = (props: RouteComponentProps) => {
  const navigate = useNavigate();
  const account = useAccount();
  // TODO, actually get this number back and format it
  const formattedFullPhoneNumber = '+1 (555) 555-5555';

  const goHome = () => navigate(SETTINGS_PATH + '#security', { replace: true });

  return (
    <AppLayout>
      <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
      <CardHeader
        headingText="Remove recovery phone number"
        headingTextFtlId="recovery-phone-remove-header"
      />
      <FtlMsg
        id="settings-recovery-phone-remove-info"
        vars={{ formattedFullPhoneNumber }}
        elems={{ strong: <strong></strong> }}
      >
        <p>
          This will remove <strong>{formattedFullPhoneNumber}</strong> as your
          recovery phone.
        </p>
      </FtlMsg>

      <Banner
        type="info"
        isFancy
        customContent={
          <div>
            <FtlMsg id="settings-recovery-phone-remove-recommend">
              <p>
                We recommend you keep this method because it’s easier than
                saving backup authentication codes.
              </p>
            </FtlMsg>

            <FtlMsg
              id="settings-recovery-phone-remove-recovery-methods"
              elems={{
                linkExternal: sumoTwoStepLink,
              }}
            >
              <p className="mt-4">
                If you delete it, make sure you still have your saved
                authentication codes. {sumoTwoStepLink}
              </p>
            </FtlMsg>
          </div>
        }
      />

      <FtlMsg id="settings-recovery-phone-remove-button">
        <button
          className="cta-caution cta-xl w-full mt-10"
          data-glean-id="two_step_auth_phone_remove_confirm_submit"
          onClick={async () => {
            // TODO, implement functionality
            await account.removeRecoveryPhone();
          }}
        >
          Remove phone number
        </button>
      </FtlMsg>

      <div className="text-center mt-4">
        <FtlMsg id="settings-recovery-phone-remove-cancel">
          <Link className="link-blue text-sm" to={SETTINGS_PATH}>
            Cancel
          </Link>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default PageRecoveryPhoneRemove;
