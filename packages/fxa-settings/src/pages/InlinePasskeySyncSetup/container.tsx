/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import PasskeyCreationPromoContainer, {
  PasskeyPromoStatus,
} from '../../components/PasskeyCreationPromo/container';
import { useReauthKb } from '../../components/PasskeyCreationPromo/useReauthKb';
import { useNavigateWithQuery } from '../../lib/hooks';
import { PASSKEY_PROMO_DISMISS_KEYS } from '../../lib/passkeys/promo';
import { useSensitiveDataClient } from '../../models';

/**
 * The passkey promo after a desktop Sync password sign-in. The browser already
 * has the login, so every exit continues to `/pair`. Only a sign-in that set
 * the promo marker is eligible; the sync step derives `kB` by reauthenticating,
 * which storing a wrap requires.
 */
const InlinePasskeySyncSetupContainer = () => {
  const sensitiveDataClient = useSensitiveDataClient();
  // Read once: leaving the route clears the marker.
  const [promo] = useState(() => sensitiveDataClient.PasskeySyncPromoData);
  const getKb = useReauthKb();
  const navigateWithQuery = useNavigateWithQuery();

  const onExit = (status?: PasskeyPromoStatus) =>
    navigateWithQuery('/pair', {
      replace: true,
      ...(status && { state: { passkeyStatus: status } }),
    });

  return (
    <PasskeyCreationPromoContainer
      confirmation={
        <FtlMsg id="inline-passkey-sync-setup-success-banner">
          You’re signed in to Firefox
        </FtlMsg>
      }
      description={
        <FtlMsg id="inline-passkey-sync-setup-description-v2">
          Next time, use your fingerprint, face or device PIN to authenticate.
          If your device supports it, your passkey can also unlock your synced
          data.
        </FtlMsg>
      }
      onExit={onExit}
      dismissKey={PASSKEY_PROMO_DISMISS_KEYS.sync}
      eligible={!!promo}
      getKb={getKb}
    />
  );
};

export default InlinePasskeySyncSetupContainer;
