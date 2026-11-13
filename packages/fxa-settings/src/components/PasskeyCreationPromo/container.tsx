/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/browser';
import AppLayout from '../AppLayout';
import type { BannerProps } from '../Banner/interfaces';
import { MfaGuardCore } from '../Settings/MfaGuard';
import { currentAccount, JwtTokenCache, sessionToken } from '../../lib/cache';
import { useMounted } from '../../lib/hooks/useMounted';
import { clearMfaAndJwtCacheOnInvalidJwt } from '../../lib/mfa-guard-utils';
import {
  createCredentialWithPrfFallback,
  stripPrfResults,
} from '../../lib/passkeys/prf-fallback';
import {
  canPromptForPasskey,
  dismissPasskeyPromo,
} from '../../lib/passkeys/promo';
import {
  categorizeWebAuthnError,
  WebAuthnErrorCategory,
} from '../../lib/passkeys/webauthn-errors';
import {
  createPasskeyWrap,
  stepUpWithPrf,
} from '../../lib/passkeys/wrap/creation';
import { MfaReason } from '../../lib/types';
import { useAuthClient, useConfig, useFtlMsgResolver } from '../../models';
import PasskeyCreationPromo, { PasskeyCreationPromoStep } from '.';

type StatusBanner = Pick<BannerProps, 'type' | 'content' | 'link'>;

/** How the promo ended once a passkey exists, for the next page to show. */
export type PasskeyPromoStatus = {
  type: 'success' | 'info';
  localizedHeading: string;
  localizedDescription?: string;
};

export type PasskeyCreationPromoContainerProps = {
  confirmation: ReactNode;
  description: ReactNode;
  /** Leaves the promo. `status` is set when a passkey was created. */
  onExit: (status?: PasskeyPromoStatus) => void;
  dismissKey: string;
  /** Checks that need no server call: flags, dismissal, held material. */
  eligible: boolean;
  /**
   * Returns a fresh copy of `kB`, which the wrap zeroes after sealing. Omit
   * when this sign-in can't produce `kB`; the passkey is then for sign-in only.
   */
  getKb?: () => Promise<Uint8Array>;
};

/**
 * Offers a passkey right after sign-in or signup. Creating it takes an email
 * code, then `create()`. When `kB` is available and the authenticator has PRF,
 * an optional second step runs a `get()` pinned to the new passkey, whose PRF
 * output seals `kB` into a wrap so the passkey can also unlock synced data.
 */
const PasskeyCreationPromoContainer = ({
  confirmation,
  description,
  onExit,
  dismissKey,
  eligible,
  getKb,
}: PasskeyCreationPromoContainerProps) => {
  const authClient = useAuthClient();
  const config = useConfig();
  const ftlMsgResolver = useFtlMsgResolver();
  const mounted = useMounted();

  const [session] = useState(() => sessionToken());
  const [email] = useState(() => currentAccount()?.email);

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<PasskeyCreationPromoStep>('offer');
  const [banner, setBanner] = useState<StatusBanner>();
  const [busy, setBusy] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const credentialId = useRef<string | undefined>(undefined);

  const exit = () => onExit();

  useEffect(() => {
    if (!eligible || !session || !email) {
      exit();
      return;
    }
    authClient
      .listPasskeys(session)
      .then((passkeys) => {
        if (!mounted.current) return;
        if (canPromptForPasskey(config, passkeys.length)) {
          setReady(true);
        } else {
          exit();
        }
      })
      .catch(exit);
    // Decided once on mount, so creating a passkey doesn't make the page ineligible.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishWith = (
    localizedHeading: string,
    localizedDescription?: string,
    type: PasskeyPromoStatus['type'] = 'info'
  ) => onExit({ type, localizedHeading, localizedDescription });

  const created = () =>
    ftlMsgResolver.getMsg('passkey-creation-promo-created', 'Passkey created');

  const finishWithoutPrf = () =>
    finishWith(
      created(),
      ftlMsgResolver.getMsg(
        'passkey-creation-promo-no-prf-description',
        'You can sign in with it, but it can’t unlock synced data on this device. You’ll still need your password to sync on a new device.'
      )
    );

  const wrapErrorMessage = () =>
    ftlMsgResolver.getMsg(
      'passkey-creation-promo-error-wrap',
      'Your passkey was created but couldn’t be set up for sync. You can still sign in with it.'
    );

  const setUpForSync = async () => {
    if (!getKb || !session || !credentialId.current) return;
    setBusy(true);
    setBanner(undefined);
    try {
      const { mfaToken, prfOut } = await stepUpWithPrf(
        authClient,
        session,
        credentialId.current
      );
      if (!mounted.current) {
        prfOut?.fill(0);
        return;
      }
      if (!prfOut) {
        finishWithoutPrf();
        return;
      }
      // Fetched only once PRF output exists, so kB isn't held for nothing.
      let kB: Uint8Array;
      try {
        kB = await getKb();
      } catch (err) {
        prfOut.fill(0);
        throw err;
      }
      const result = await createPasskeyWrap(authClient, {
        credentialId: credentialId.current,
        mfaToken,
        sessionToken: session,
        prfOut,
        kB,
      });
      if (!mounted.current) return;
      if (result.ok) {
        finishWith(
          ftlMsgResolver.getMsg(
            'passkey-creation-promo-sync-success',
            'Your passkey is set up for sync'
          ),
          undefined,
          'success'
        );
        return;
      }
      finishWith(wrapErrorMessage());
    } catch (err) {
      if (!mounted.current) return;
      const categorized = categorizeWebAuthnError(err, 'authentication');
      if (categorized.category === WebAuthnErrorCategory.UserAction) {
        setBanner({
          type: 'warning',
          content: {
            localizedHeading: ftlMsgResolver.getMsg(
              'passkey-creation-promo-error-confirm',
              'Passkey confirmation didn’t finish'
            ),
            localizedDescription: ftlMsgResolver.getMsg(
              'passkey-creation-promo-error-confirm-description',
              'Use your new passkey again to finish setting it up for sync.'
            ),
          },
        });
        setStep('retry');
        return;
      }
      if (categorized.logToSentry) {
        // Synthetic Error: backend error bodies may carry identifiers.
        Sentry.captureException(new Error('passkey-promo wrap error'));
      }
      finishWith(wrapErrorMessage());
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  // Runs once the email code has produced an `mfa:passkey` token.
  const register = async () => {
    setShowMfa(false);
    if (!session) return;
    setBusy(true);
    const jwt = JwtTokenCache.getToken(session, 'passkey');
    try {
      const options = await authClient.beginPasskeyRegistration(jwt);
      const credential = await createCredentialWithPrfFallback(options);
      await authClient.completePasskeyRegistration(
        jwt,
        stripPrfResults(credential),
        options.challenge
      );
      credentialId.current = credential.id;
      if (!mounted.current) return;
      setBusy(false);
      if (!getKb) {
        finishWith(created(), undefined, 'success');
        return;
      }
      // `create()` reports PRF support; without it a second prompt can't help.
      const prf = (
        credential.clientExtensionResults as { prf?: { enabled?: boolean } }
      ).prf;
      if (prf?.enabled === false) {
        finishWithoutPrf();
        return;
      }
      setStep('confirm');
    } catch (err) {
      clearMfaAndJwtCacheOnInvalidJwt(err, 'passkey', session);
      if (!mounted.current) return;
      setBusy(false);
      setBanner({
        type: 'error',
        content: {
          localizedHeading: ftlMsgResolver.getMsg(
            'passkey-creation-promo-error-create',
            'Passkey setup didn’t finish. Try again.'
          ),
        },
      });
    }
  };

  const onPrimary = () => {
    if (step === 'offer') {
      setBanner(undefined);
      setShowMfa(true);
    } else {
      setUpForSync();
    }
  };

  const onSecondary = () => {
    if (step === 'offer') {
      dismissPasskeyPromo(dismissKey);
      exit();
    } else {
      // Skipping the sync step still leaves a passkey for sign-in.
      finishWith(created(), undefined, 'success');
    }
  };

  if (!ready || !session || !email) {
    return <AppLayout loading />;
  }

  return (
    <PasskeyCreationPromo
      {...{
        step,
        confirmation,
        description,
        onPrimary,
        onSecondary,
        busy,
        banner,
      }}
    >
      {showMfa && (
        <MfaGuardCore
          requiredScope="passkey"
          reason={MfaReason.createPasskey}
          email={email}
          sessionToken={session}
          onDismiss={() => setShowMfa(false)}
          onSessionInvalid={exit}
          onFatalError={(localizedHeading) => {
            setShowMfa(false);
            setBanner({ type: 'error', content: { localizedHeading } });
          }}
        >
          <RunOnce run={register} />
        </MfaGuardCore>
      )}
    </PasskeyCreationPromo>
  );
};

/** Runs `run` once when mounted, i.e. once the MFA guard renders its children. */
function RunOnce({ run }: { run: () => void }) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    run();
  });
  return null;
}

export default PasskeyCreationPromoContainer;
