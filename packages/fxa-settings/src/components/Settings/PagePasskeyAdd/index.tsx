/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef } from 'react';
import { RouteComponentProps } from '@reach/router';
import * as Sentry from '@sentry/browser';

import { SETTINGS_PATH } from '../../../constants';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { MfaReason } from '../../../lib/types';
import {
  useAccount,
  useAlertBar,
  useAuthClient,
  useFtlMsgResolver,
} from '../../../models';
import { createCredential } from '../../../lib/passkeys/webauthn';
import {
  handleWebAuthnError,
  WebAuthnErrorType,
} from '../../../lib/passkeys/webauthn-errors';
import { MfaGuard, useMfaErrorHandler } from '../MfaGuard';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { FtlMsg } from 'fxa-react/lib/utils';
import GleanMetrics from '../../../lib/glean';

export const MfaGuardPagePasskeyAdd = (_: RouteComponentProps) => {
  return (
    <MfaGuard requiredScope="passkey" reason={MfaReason.createPasskey}>
      <PagePasskeyAdd />
    </MfaGuard>
  );
};

export const PagePasskeyAdd = () => {
  const account = useAccount();
  const authClient = useAuthClient();
  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const handleMfaError = useMfaErrorHandler();

  const ceremonyStarted = useRef(false);
  const isMounted = useRef(true);

  const navigateToSettings = useCallback(() => {
    navigateWithQuery(SETTINGS_PATH + '#security', { replace: true });
  }, [navigateWithQuery]);

  const handleCancel = useCallback(() => {
    navigateToSettings();
  }, [navigateToSettings]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (ceremonyStarted.current) return;
    ceremonyStarted.current = true;

    const runCeremony = async () => {
      GleanMetrics.accountPref.passkeyCreateView();

      // Tracks whether the server sent an excludeCredentials list (i.e., the
      // account already has passkeys). Used to bias NotAllowedError toward the
      // "duplicate authenticator" interpretation on Firefox, which collapses
      // that case and user-cancel into the same DOMException.
      let hadExcludeCredentials = false;
      try {
        // Step 1: Get registration options from server
        const jwt = account.getCachedJwtByScope('passkey');
        const creationOptions = await authClient.beginPasskeyRegistration(jwt);
        const challenge = creationOptions.challenge;
        hadExcludeCredentials = !!creationOptions.excludeCredentials?.length;

        if (!isMounted.current) return;

        // Step 2: Browser WebAuthn prompt
        const credential = await createCredential(creationOptions);

        if (!isMounted.current) return;

        // Step 3: Complete registration with server
        await authClient.completePasskeyRegistration(
          jwt,
          credential,
          challenge
        );
        await account.refresh('passkeys');

        if (!isMounted.current) return;

        // Success
        GleanMetrics.accountPref.passkeyCreateSuccessView();
        alertBar.success(
          ftlMsgResolver.getMsg('page-passkey-add-success', 'Passkey created')
        );
        navigateToSettings();
      } catch (error) {
        if (!isMounted.current) return;

        // Check if MFA JWT expired
        if (handleMfaError(error)) return;

        // Check if WebAuthn error
        if (error instanceof DOMException || error instanceof TypeError) {
          const categorized = handleWebAuthnError(
            error,
            'registration',
            Sentry.captureException,
            { hadExcludeCredentials }
          );
          const reasonMap: Record<string, string> = {
            [WebAuthnErrorType.NotAllowed]: 'not_allowed',
            [WebAuthnErrorType.Timeout]: 'timeout',
            [WebAuthnErrorType.NotSupported]: 'not_supported',
            [WebAuthnErrorType.Security]: 'security',
          };
          GleanMetrics.accountPref.passkeyCreateSubmitFrontendError({
            event: {
              reason: reasonMap[categorized.errorType] || 'webauthn_unknown',
            },
          });
          alertBar.error(
            ftlMsgResolver.getMsg(categorized.ftlId, categorized.fallbackText)
          );
          navigateToSettings();
          return;
        }

        // Server error
        GleanMetrics.accountPref.passkeyCreateSubmitFrontendError({
          event: { reason: 'server_error' },
        });
        Sentry.captureException(error);
        alertBar.error(
          ftlMsgResolver.getMsg(
            'page-passkey-add-error-system',
            'System not available. Try again later.'
          )
        );
        navigateToSettings();
      }
    };

    runCeremony();
  }, [
    account,
    authClient,
    alertBar,
    ftlMsgResolver,
    handleMfaError,
    navigateToSettings,
  ]);

  return (
    <div
      className="max-w-lg mx-auto mt-6 p-10 tablet:my-10 flex flex-col items-center bg-white dark:bg-grey-700 shadow tablet:rounded-xl border border-transparent text-center"
      data-testid="page-passkey-add"
    >
      <LoadingSpinner className="flex justify-center mb-6" />
      <FtlMsg id="page-passkey-add-creating-heading">
        <h2 className="text-xl font-bold mb-2">Creating passkey…</h2>
      </FtlMsg>
      <FtlMsg id="page-passkey-add-follow-prompts">
        <p className="text-grey-400 dark:text-grey-200 mb-6">
          Follow the prompts on your device.
        </p>
      </FtlMsg>
      <FtlMsg id="page-passkey-add-cancel">
        <button
          onClick={handleCancel}
          className="link-blue text-sm"
          data-testid="passkey-add-cancel"
          data-glean-id="account_pref_passkey_create_cancel"
        >
          Cancel
        </button>
      </FtlMsg>
    </div>
  );
};

export default PagePasskeyAdd;
