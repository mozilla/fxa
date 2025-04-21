/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { SETTINGS_PATH } from '../../../constants';
import CardHeader from '../../CardHeader';
import Banner from '../../Banner';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useAccount, useAlertBar, useFtlMsgResolver } from '../../../models';
import FlowContainer from '../FlowContainer';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import GleanMetrics from '../../../lib/glean';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';

// TODO, update this link with #section-heading once the SUMO article is updated (FXA-10918)
const sumoTwoStepLink = (
  <LinkExternal
    className="link-blue"
    href="https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication"
  >
    Compare recovery methods
  </LinkExternal>
);

const PageRecoveryPhoneRemove = (props: RouteComponentProps) => {
  const navigateWithQuery = useNavigateWithQuery();
  const account = useAccount();
  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();

  const { phoneNumber, nationalFormat } = account.recoveryPhone;
  // Use phoneNumber as a fallback in case nationalFormat is not available
  const formattedFullPhoneNumber = nationalFormat || phoneNumber;

  const goHome = () =>
    navigateWithQuery(SETTINGS_PATH + '#security', { replace: true });

  const gleanSuccessView =
    GleanMetrics.accountPref.twoStepAuthPhoneRemoveSuccessView;

  const alertSuccessAndGoHome = useCallback(() => {
    alertBar.success(
      ftlMsgResolver.getMsg(
        'settings-recovery-phone-remove-success',
        'Recovery phone removed'
      ),
      gleanSuccessView
    );
    navigateWithQuery(SETTINGS_PATH + '#security', { replace: true });
  }, [alertBar, ftlMsgResolver, gleanSuccessView, navigateWithQuery]);

  const clickRemoveRecoveryPhone = useCallback(async () => {
    try {
      await account.removeRecoveryPhone();
      // get the latest status of recovery phone info and availability
      // ensure correct data is shown on the settings page
      // and that service availability is correctly checked against current location
      await account.refresh('recoveryPhone');
      alertSuccessAndGoHome();
    } catch (e) {
      const localizedError = getLocalizedErrorMessage(ftlMsgResolver, e);
      alertBar.error(localizedError);
    }
  }, [account, alertSuccessAndGoHome, alertBar, ftlMsgResolver]);

  // Should never happen, but just in case, and makes TS happy.
  if (!formattedFullPhoneNumber) {
    goHome();
    return <></>;
  }

  return (
    <FlowContainer hideBackButton={true}>
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
        iconAlign={'start'}
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
          onClick={clickRemoveRecoveryPhone}
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
    </FlowContainer>
  );
};

export default PageRecoveryPhoneRemove;
