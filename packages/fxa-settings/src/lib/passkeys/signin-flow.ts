/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import * as Sentry from '@sentry/browser';
import type AuthClient from 'fxa-auth-client/browser';
import { FtlMsgResolver } from 'fxa-react/lib/utils';

import Banner from '../../components/Banner';
import { AuthUiErrors } from '../auth-errors/auth-errors';
import { useNavigateWithQuery } from '../hooks/useNavigateWithQuery';
import { FinishOAuthFlowHandler } from '../oauth/hooks';
import { storeAccountData } from '../storage-utils';
import { NavigationOptions } from '../../pages/Signin/interfaces';
import {
  ensureCanLinkAcountOrRedirect,
  handleNavigation,
} from '../../pages/Signin/utils';
import {
  getCredential,
  handleWebAuthnError,
  isWebAuthnLevel3Supported,
  type PublicKeyCredentialJSON,
} from './';

/**
 * Reuses handleNavigation's integration type (SigninIntegration) because
 * the hook forwards `integration` straight through to it. Narrowing this
 * to just the methods the hook calls would require handleNavigation to
 * have its own structural integration type — a moderate refactor across
 * every handleNavigation caller. Accepted tradeoff for now.
 */
export type PasskeySignInIntegration = NavigationOptions['integration'];

/** Pick<> so tests can pass minimal mocks without `as any`. */
export type PasskeySignInAuthClient = Pick<
  AuthClient,
  'beginPasskeyAuthentication' | 'completePasskeyAuthentication' | 'account'
>;

/**
 * Shape of an entry in `authClient.account(...)`'s `emails` array. The
 * auth-client return type isn't formally typed; this local interface
 * documents the subset we depend on.
 */
type AccountEmail = {
  email: string;
  isPrimary: boolean;
  verified: boolean;
};

export interface UsePasskeySignInArgs {
  integration: PasskeySignInIntegration;
  authClient: PasskeySignInAuthClient;
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  ftlMsgResolver: FtlMsgResolver;
  navigateWithQuery: ReturnType<typeof useNavigateWithQuery>;
  queryParams: string;
}

export interface UsePasskeySignInResult {
  isLoading: boolean;
  errorBanner: React.ReactNode | undefined;
  onClick: () => Promise<void>;
}

export function usePasskeySignIn({
  integration,
  authClient,
  finishOAuthFlowHandler,
  ftlMsgResolver,
  navigateWithQuery,
  queryParams,
}: UsePasskeySignInArgs): UsePasskeySignInResult {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const inFlight = useRef(false);

  const errorBanner = useMemo<React.ReactNode | undefined>(
    () =>
      errorMessage
        ? React.createElement(Banner, {
            type: 'error',
            content: { localizedHeading: errorMessage },
          })
        : undefined,
    [errorMessage]
  );

  const setLocalizedError = useCallback(
    (ftlId: string, fallback: string) => {
      setErrorMessage(ftlMsgResolver.getMsg(ftlId, fallback));
    },
    [ftlMsgResolver]
  );

  const onClick = useCallback(async () => {
    if (inFlight.current) {
      return;
    }
    setErrorMessage(undefined);

    // Button stays visible even without support — the user may have a passkey
    // on another device and deserves an explicit error rather than a silently
    // missing option.
    if (!isWebAuthnLevel3Supported()) {
      setLocalizedError(
        'passkey-authentication-error-not-supported-v2',
        'Your browser or device doesn’t support passkeys.'
      );
      return;
    }

    // Defensive: webchannel-driven OAuth may leave this component mounted on
    // success; without finish() the button stays stuck in loading.
    const finish = () => {
      inFlight.current = false;
      setIsLoading(false);
    };
    const setUnexpectedError = () =>
      setLocalizedError(
        'passkey-authentication-error-unexpected',
        'Something went wrong. Try again or choose another sign-in method.'
      );

    inFlight.current = true;
    setIsLoading(true);

    try {
      // Discoverable credentials only — the Signin page's email field is
      // intentionally ignored. The browser surfaces all credentials for the
      // RP and the user picks one.
      const challengeOptions = await authClient.beginPasskeyAuthentication();

      // Isolated try/catch so a network-layer TypeError (e.g. fetch failure)
      // from surrounding auth-client calls can't be miscategorised as a
      // WebAuthn error.
      let credential: PublicKeyCredentialJSON;
      try {
        credential = await getCredential(challengeOptions);
      } catch (err) {
        if (err instanceof DOMException || err instanceof TypeError) {
          const categorized = handleWebAuthnError(
            err,
            'authentication',
            Sentry.captureException
          );
          setLocalizedError(categorized.ftlId, categorized.fallbackText);
          finish();
          return;
        }
        throw err;
      }

      const service = integration.getService();
      const completion = await authClient.completePasskeyAuthentication(
        credential,
        challengeOptions.challenge,
        service ? { service } : {}
      );

      // Server response intentionally omits email — fetch it here. Fail
      // closed if missing; downstream code (storeAccountData, can_link_account
      // WebChannel, handleNavigation) would silently corrupt with undefined.
      // The server returns canonical (lowercased) email; safe to forward as-is.
      const account = await authClient.account(completion.sessionToken);
      const email = account?.emails?.find(
        (e: AccountEmail) => e.isPrimary
      )?.email;
      if (typeof email !== 'string') {
        throw new Error('Authenticated account response missing email');
      }

      // Runs before storeAccountData so a dismissed merge dialog doesn't
      // leave a ghost session that Index would re-evaluate as signed-in.
      if (integration.isSync() || integration.isFirefoxNonSync()) {
        const canLink = await ensureCanLinkAcountOrRedirect({
          email,
          uid: completion.uid,
          ftlMsgResolver,
          navigateWithQuery,
        });
        if (!canLink) {
          // Defensive finish() — ensureCanLinkAcountOrRedirect navigates
          // away, but Index → Index with prefill keeps this component
          // mounted and the button needs to be clickable again.
          finish();
          return;
        }
      }

      // Mirrors Signin/container.tsx's persist-after-sign-in pattern.
      storeAccountData({
        email,
        uid: completion.uid,
        lastLogin: Date.now(),
        sessionToken: completion.sessionToken,
        verified: completion.verified,
        sessionVerified: completion.verified,
        hasPassword: completion.hasPassword,
      });

      if (completion.requiresPasswordForSync) {
        // Sync still needs a password to derive keys
        const fallbackPath = completion.hasPassword
          ? '/signin_passkey_fallback'
          : '/post_verify/passkey/set_password';
        navigateWithQuery(fallbackPath);
        return;
      }

      const accountHasTotp = !!account?.totp?.verified;

      // Delegate to handleNavigation (same path as password sign-in).
      const { error: navError } = await handleNavigation({
        email,
        signinData: {
          uid: completion.uid,
          sessionToken: completion.sessionToken,
          // Passkey assertion is AAL2; email was verified at registration.
          emailVerified: true,
          sessionVerified: completion.verified,
          verificationMethod: undefined,
          verificationReason: undefined,
        },
        integration,
        finishOAuthFlowHandler,
        queryParams,
        handleFxaLogin: true,
        handleFxaOAuthLogin: true,
        performNavigation: true,
        isPasskeySession: true,
        accountHasTotp,
      });

      if (navError) {
        Sentry.captureException(navError);
        setUnexpectedError();
      }
      finish();
    } catch (err) {
      const errno = (err as { errno?: number })?.errno;
      if (errno === AuthUiErrors.PASSKEY_NOT_FOUND.errno) {
        // Expected divergence between server state and authenticator state
        // (e.g. user deleted the passkey elsewhere). Not Sentry-worthy.
        setLocalizedError(
          'passkey-authentication-error-not-found',
          'Passkey not recognized. Use another sign-in method.'
        );
      } else {
        // Drop upstream err.message — backend shapes may include identifiers
        // (uid, email) we can't enforce from here. errno tag + Sentry stack
        // are enough for triage.
        Sentry.captureException(new Error('passkey-signin error'), {
          tags: { errno: String(errno ?? 'none') },
        });
        setUnexpectedError();
      }
      finish();
    }
  }, [
    integration,
    authClient,
    finishOAuthFlowHandler,
    ftlMsgResolver,
    navigateWithQuery,
    queryParams,
    setLocalizedError,
  ]);

  return { isLoading, errorBanner, onClick };
}
