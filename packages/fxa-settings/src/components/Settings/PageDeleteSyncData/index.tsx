/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { SETTINGS_PATH } from '../../../constants';
import {
  clearSignedInAccountUid,
  JwtTokenCache,
  MfaOtpRequestCache,
  sessionToken,
  setSigningOut,
} from '../../../lib/cache';
import firefox from '../../../lib/channels/firefox';
import GleanMetrics from '../../../lib/glean';
import { useGleanView } from '../../../lib/glean/useGleanView';
import { useMfaErrorHandler, useNavigateWithQuery } from '../../../lib/hooks';
import { MfaReason } from '../../../lib/types';
import {
  AttachedClient,
  useAccount,
  useAlertBar,
  useFtlMsgResolver,
} from '../../../models';
import { MfaGuard } from '../MfaGuard';
import FlowDeleteSyncDataConfirmPwd from '../FlowDeleteSyncDataConfirmPwd';
import FlowDeleteSyncDataDevices, {
  SyncDevice,
} from '../FlowDeleteSyncDataDevices';
import { getSyncDevices } from './utils';

export const MfaGuardPageDeleteSyncData = () => (
  <MfaGuard requiredScope="sync_data" reason={MfaReason.deleteSyncData}>
    <PageDeleteSyncData />
  </MfaGuard>
);

// TODO FXA-15112: final copy and .ftl strings for these three messages.
const SUCCESS_MESSAGE =
  'Deleting synced data from Mozilla’s servers. This may take some time.';
const DELETE_ERROR_MESSAGE =
  'We couldn’t delete your synced data from Mozilla’s servers. Try again later.';
const SIGN_OUT_ERROR_MESSAGE =
  'Your sync data was successfully deleted from Mozilla’s servers but there was a problem signing you out of all your devices. Please try again later.';

export type PageDeleteSyncDataProps = {
  /** Defaults to the account's sync-capable attached clients. */
  syncCapableDevices?: SyncDevice[];
};

export const PageDeleteSyncData = ({
  syncCapableDevices,
}: PageDeleteSyncDataProps) => {
  const account = useAccount();
  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();
  const handleMfaError = useMfaErrorHandler();
  const navigateWithQuery = useNavigateWithQuery();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  useGleanView(GleanMetrics.deleteSyncData.passwordView, currentStep === 1);
  useGleanView(GleanMetrics.deleteSyncData.devicesView, currentStep === 2);

  const devices = syncCapableDevices ?? getSyncDevices(account.attachedClients);

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'delete-sync-data-page-title',
    'Delete synced data'
  );
  const localizedBackButtonTitle = ftlMsgResolver.getMsg(
    'delete-sync-data-back-button-title',
    'Back to settings'
  );

  const goHome = () =>
    navigateWithQuery(`${SETTINGS_PATH}#data-collection`, { replace: true });

  const signOut = async (client: AttachedClient) => {
    await account.disconnectClient(client);
    GleanMetrics.accountPref.deviceSignout({
      event: { reason: 'sync_data_deletion' },
    });
  };

  /**
   * Deletes first, then signs out, so a failed delete does not sign any devices
   * out. The current device goes last because its record carries the session
   * Settings is running on, so signing it out ends this session.
   *
   * There's an edge case we should consider with (issue #2 to be filed). FxA pushes
   * the disconnect to attached devices, but a device that misses the push keeps
   * syncing until its access token expires, because we don't revoke access tokens
   * (only refresh and session tokens) and even if we did, tokenserver verifies JWTs
   * locally and doesn't know it's been revoked.
   */
  const handleConfirm = async (signOutClients: AttachedClient[]) => {
    setIsLoading(true);

    try {
      await account.deleteSyncData();
    } catch (err) {
      // An expired MFA token re-opens the guard instead of showing an error.
      if (!handleMfaError(err)) {
        GleanMetrics.deleteSyncData.error({
          event: { reason: 'delete_failed' },
        });
        alertBar.error(DELETE_ERROR_MESSAGE);
      }
      setIsLoading(false);
      return;
    }
    GleanMetrics.deleteSyncData.success();

    const current = signOutClients.find((c) => c.isCurrentSession);
    const others = signOutClients.filter((c) => c !== current);

    const results = await Promise.allSettled(others.map(signOut));
    let signOutFailed = results.some((r) => r.status === 'rejected');

    if (!signOutFailed && current) {
      try {
        await signOut(current);
        const token = sessionToken();
        // The browser holds this session too and decides what to do on logout;
        // mobile dismisses the Settings web view instead of showing email-first.
        firefox.fxaLogout({ uid: account.uid });
        if (token) {
          JwtTokenCache.clearTokens(token);
          MfaOtpRequestCache.clear(token);
        }
        setSigningOut(true);
        clearSignedInAccountUid();
        // Drops `email` from the query; email-first would otherwise resubmit
        // the account that was just signed out.
        navigate('/', { state: { deleteSyncDataSuccess: true } });
        return;
      } catch {
        signOutFailed = true;
      }
    }

    if (signOutFailed) {
      GleanMetrics.deleteSyncData.error({
        event: { reason: 'sign_out_failed' },
      });
      alertBar.error(SIGN_OUT_ERROR_MESSAGE);
    } else {
      alertBar.success(SUCCESS_MESSAGE);
    }
    goHome();
  };

  const sharedStepProps = {
    localizedBackButtonTitle,
    localizedPageTitle,
  };

  return currentStep === 1 ? (
    <FlowDeleteSyncDataConfirmPwd
      {...sharedStepProps}
      navigateBackward={goHome}
      navigateForward={() => setCurrentStep(2)}
    />
  ) : (
    <FlowDeleteSyncDataDevices
      {...sharedStepProps}
      {...{ devices, isLoading }}
      navigateBackward={() => !isLoading && setCurrentStep(1)}
      onCancel={() => !isLoading && goHome()}
      onConfirm={handleConfirm}
    />
  );
};

export default PageDeleteSyncData;
