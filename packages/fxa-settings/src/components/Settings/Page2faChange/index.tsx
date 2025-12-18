/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';

import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

import { SETTINGS_PATH } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { useTotpReplace } from '../../../lib/hooks/useTotpReplace';
import { useAccount, useAlertBar, useFtlMsgResolver } from '../../../models';

import FlowSetup2faApp from '../FlowSetup2faApp';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { GleanClickEventType2FA, MfaReason } from '../../../lib/types';
import { FtlMsg } from 'fxa-react/lib/utils';
import { MfaGuard, useMfaErrorHandler } from '../MfaGuard';

export const MfaGuardPage2faChange = (_: RouteComponentProps) => {
  return (
    <MfaGuard requiredScope="2fa" reason={MfaReason.changeTotp}>
      <Page2faChange />
    </MfaGuard>
  );
};

export const Page2faChange = () => {
  const account = useAccount();
  const alertBar = useAlertBar();
  const handleMfaError = useMfaErrorHandler();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const {
    totpInfo,
    loading: totpInfoLoading,
    error: totpInfoError,
  } = useTotpReplace();

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'page-2fa-change-title',
    'Change two-step authentication'
  );

  const customQrInstructionEl = (
    <FtlMsg
      id="page-2fa-change-qr-instruction"
      elems={{ strong: <strong></strong> }}
    >
      <p className="text-sm">
        <strong>Step 1: </strong> Scan this QR code using any authenticator app,
        like Duo or Google Authenticator. This creates a new connection, any old
        connections won’t work anymore.
      </p>
    </FtlMsg>
  );

  const alertBarSuccessMessage = useCallback(() => {
    return (
      <div className="text-center">
        <p>
          <strong>
            {ftlMsgResolver.getMsg(
              'page-2fa-change-success',
              'Two-step authentication has been updated'
            )}
          </strong>
        </p>
        <p>
          {ftlMsgResolver.getMsg(
            'page-2fa-change-success-additional-message',
            'To protect all your connected devices, you should sign out everywhere you’re using this account, and then sign back in using your new two-step authentication.'
          )}
        </p>
      </div>
    );
  }, [ftlMsgResolver]);

  const showSuccess = useCallback(() => {
    alertBar.success(alertBarSuccessMessage());
  }, [alertBar, alertBarSuccessMessage]);

  const showGenericError = useCallback(() => {
    alertBar.error(
      ftlMsgResolver.getMsg(
        'page-2fa-change-totpinfo-error',
        'There was an error replacing your two-step authentication app. Try again later.'
      )
    );
  }, [alertBar, ftlMsgResolver]);

  const goBackToSettings = useCallback(
    () =>
      navigateWithQuery(
        SETTINGS_PATH + '#two-step-authentication',
        {
          replace: true,
        },
        false
      ),
    [navigateWithQuery]
  );

  // if there is an issue retrieving totp info, 2FA cannot be set up
  // --> return to main settings page with alert bar message
  useEffect(() => {
    if (!totpInfoLoading && (totpInfoError || !totpInfo)) {
      showGenericError();
      goBackToSettings();
    }
  }, [
    totpInfoLoading,
    totpInfoError,
    totpInfo,
    showGenericError,
    goBackToSettings,
  ]);

  /* ───── early return states ───── */
  if (totpInfoLoading) return <LoadingSpinner fullScreen />;

  if (totpInfoError || !totpInfo) {
    return <></>;
  }

  /* ───── handlers ───── */
  const handleVerify2faAppCode = async (code: string) => {
    try {
      await account.confirmReplaceTotpWithJwt(code);
    } catch (error) {
      const errorHandled = handleMfaError(error);
      if (errorHandled) {
        return {};
      }
      return { error: true };
    }

    GleanMetrics.accountPref.twoStepAuthQrCodeSuccess();

    showSuccess();
    // We want to show the connected services page after success,
    // to make it easier for the user to disconnect other devices or services
    // that are not verified with the new 2FA connection..
    navigateWithQuery(
      `${SETTINGS_PATH}#connected-services`,
      {
        replace: true,
      },
      false
    );
    return {};
  };

  return (
    <VerifiedSessionGuard
      onDismiss={goBackToSettings}
      onError={goBackToSettings}
    >
      <FlowSetup2faApp
        verifyCode={handleVerify2faAppCode}
        onBackButtonClick={goBackToSettings}
        {...{ localizedPageTitle, customQrInstructionEl, totpInfo }}
        reason={GleanClickEventType2FA.replace}
      />
    </VerifiedSessionGuard>
  );
};

export default MfaGuardPage2faChange;
