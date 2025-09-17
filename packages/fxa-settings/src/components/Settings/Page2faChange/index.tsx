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
import { GleanClickEventType2FA } from '../../../lib/types';
import { FtlMsg } from 'fxa-react/lib/utils';

const Page2faChange = (_: RouteComponentProps) => {
  const account = useAccount();
  const alertBar = useAlertBar();
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

  const showSuccess = useCallback(() => {
    alertBar.success(
      ftlMsgResolver.getMsg(
        'page-2fa-change-success',
        'Two-step authentication has been updated'
      )
    );
  }, [alertBar, ftlMsgResolver]);

  const showGenericError = useCallback(() => {
    alertBar.error(
      ftlMsgResolver.getMsg(
        'page-2fa-change-totpinfo-error',
        'There was an error replacing your two-step authentication app. Try again later.'
      )
    );
  }, [alertBar, ftlMsgResolver]);

  const goHome = useCallback(
    () =>
      navigateWithQuery(SETTINGS_PATH + '#two-step-authentication', {
        replace: true,
      }),
    [navigateWithQuery]
  );

  // if there is an issue retrieving totp info, 2FA cannot be set up
  // --> return to main settings page with alert bar message
  useEffect(() => {
    if (!totpInfoLoading && (totpInfoError || !totpInfo)) {
      showGenericError();
      goHome();
    }
  }, [totpInfoLoading, totpInfoError, totpInfo, showGenericError, goHome]);

  /* ───── early return states ───── */
  if (totpInfoLoading) return <LoadingSpinner fullScreen />;

  if (totpInfoError || !totpInfo) {
    return <></>;
  }

  /* ───── handlers ───── */
  const handleVerify2faAppCode = async (code: string) => {
    try {
      await account.confirmReplaceTotp(code);
    } catch (error) {
      return { error: true };
    }

    GleanMetrics.accountPref.twoStepAuthQrCodeSuccess();

    showSuccess();
    goHome();
    return {};
  };

  return (
    <VerifiedSessionGuard onDismiss={goHome} onError={goHome}>
      <FlowSetup2faApp
        verifyCode={handleVerify2faAppCode}
        onBackButtonClick={goHome}
        {...{ localizedPageTitle, customQrInstructionEl, totpInfo }}
        reason={GleanClickEventType2FA.replace}
      />
    </VerifiedSessionGuard>
  );
};

export default Page2faChange;
