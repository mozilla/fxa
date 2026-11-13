/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useLocation } from 'react-router';
import { FtlMsg } from 'fxa-react/lib/utils';
import PasskeyCreationPromoContainer, {
  PasskeyPromoStatus,
} from '../../components/PasskeyCreationPromo/container';
import { useReauthKb } from '../../components/PasskeyCreationPromo/useReauthKb';
import { SETTINGS_PATH } from '../../constants';
import { useNavigateWithQuery } from '../../lib/hooks';
import { useAlertBar, useConfig } from '../../models';
import {
  isPasskeyPromoDismissed,
  PASSKEY_PROMO_DISMISS_KEYS,
} from '../../lib/passkeys/promo';

export type PasskeyPromoLocationState = { origin?: 'signup' };

/**
 * The passkey promo after a web signup or sign-in. After a password sign-in
 * the optional sync step is offered without asking for the password again.
 */
const PasskeyPromo = () => {
  const config = useConfig();
  const location = useLocation();
  const isSignup =
    (location.state as PasskeyPromoLocationState | null)?.origin === 'signup';
  const dismissKey = isSignup
    ? PASSKEY_PROMO_DISMISS_KEYS.signup
    : PASSKEY_PROMO_DISMISS_KEYS.signin;
  const flagOn = isSignup
    ? config.featureFlags?.passkeyPromoSignupEnabled
    : config.featureFlags?.passkeyPromoSigninEnabled;
  const [eligible] = useState(
    () => !!flagOn && !isPasskeyPromoDismissed(dismissKey)
  );

  const getKb = useReauthKb();
  const alertBar = useAlertBar();
  const navigateWithQuery = useNavigateWithQuery();

  const onExit = (status?: PasskeyPromoStatus) => {
    if (status) {
      alertBar.success(
        [status.localizedHeading, status.localizedDescription]
          .filter(Boolean)
          .join(' ')
      );
    }
    navigateWithQuery(SETTINGS_PATH, { replace: true });
  };

  return (
    <PasskeyCreationPromoContainer
      confirmation={
        isSignup ? (
          <FtlMsg id="page-passkey-promo-signup-banner">
            Your account is ready
          </FtlMsg>
        ) : (
          <FtlMsg id="page-passkey-promo-success-banner">
            You’re signed in
          </FtlMsg>
        )
      }
      description={
        <FtlMsg id="page-passkey-promo-description-v2">
          Next time, use your fingerprint, face or device PIN to authenticate.
        </FtlMsg>
      }
      onExit={onExit}
      dismissKey={dismissKey}
      eligible={eligible}
      getKb={getKb}
    />
  );
};

export default PasskeyPromo;
