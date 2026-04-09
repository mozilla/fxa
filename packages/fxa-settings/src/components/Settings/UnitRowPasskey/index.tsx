/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import UnitRow, { UnitRowProps } from '../UnitRow';
import { useAlertBar, useAuthClient, useFtlMsgResolver } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { PasskeySubRow } from '../SubRow';
import { Passkey } from 'fxa-auth-client/browser';
import { isWebAuthnLevel3Supported } from '../../../lib/passkeys/webauthn';
import { sessionToken } from '../../../lib/cache';

const MAX_PASSKEYS = 10;

export const UnitRowPasskey = () => {
  const ftlMsgResolver = useFtlMsgResolver();
  const alertBar = useAlertBar();
  const authClient = useAuthClient();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPasskeys = useCallback(async () => {
    const token = sessionToken();
    if (!token) return;
    try {
      const result = await authClient.listPasskeys(token);
      setPasskeys(result);
    } catch {
      // Silently fail — passkeys list will appear empty
    } finally {
      setLoading(false);
    }
  }, [authClient]);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  const hasPasskeys = passkeys.length > 0;
  const isLimitReached = passkeys.length >= MAX_PASSKEYS;
  const webAuthnSupported = isWebAuthnLevel3Supported();

  const handleCreateClick = useCallback(() => {
    if (!webAuthnSupported) {
      alertBar.error(
        ftlMsgResolver.getMsg(
          'passkey-row-webauthn-not-supported',
          "Your browser or device doesn't support passkeys."
        )
      );
    }
  }, [webAuthnSupported, alertBar, ftlMsgResolver]);

  const conditionalUnitRowProps: Partial<UnitRowProps> = hasPasskeys
    ? {
        statusIcon: 'checkmark',
        headerValue: ftlMsgResolver.getMsg('passkey-row-enabled', 'Enabled'),
      }
    : {
        statusIcon: 'alert',
        defaultHeaderValueText: ftlMsgResolver.getMsg(
          'passkey-row-not-set',
          'Not set'
        ),
      };

  const getSubRows = () => {
    return passkeys.map((passkey) => (
      <PasskeySubRow key={passkey.credentialId} passkey={passkey} />
    ));
  };

  const learnMoreLink = (
    <FtlMsg id="passkey-row-info-link">
      <LinkExternal
        href="https://support.mozilla.org/kb/placeholder-article" // TODO: Update with actual support article link
        className="link-blue text-sm"
      >
        How this protects your account
      </LinkExternal>
    </FtlMsg>
  );

  return (
    <>
      <UnitRow
        header={ftlMsgResolver.getMsg('passkey-row-header', 'Passkeys')}
        headerId="passkeys"
        prefixDataTestId="passkey"
        ctaText={ftlMsgResolver.getMsg('passkey-row-action-create', 'Create')}
        route={webAuthnSupported && !isLimitReached ? '/settings/passkeys/add' : undefined}
        ctaOnClickAction={!webAuthnSupported ? handleCreateClick : undefined}
        disabled={isLimitReached}
        disabledReason={ftlMsgResolver.getMsg(
          'passkey-row-limit-reached',
          "You've used all 10 passkeys. Delete a passkey to create a new one."
        )}
        {...conditionalUnitRowProps}
        subRows={getSubRows()}
      >
        <FtlMsg id="passkey-row-description">
          <p className="text-sm my-2">
            Make sign in easier and more secure by using your phone or other
            supported device to get into your account.
          </p>
        </FtlMsg>
        {learnMoreLink}
        {isLimitReached && (
          <FtlMsg id="passkey-row-limit-reached">
            <p className="text-sm mt-2 p-3 rounded bg-yellow-50 text-yellow-800">
              You've used all 10 passkeys. Delete a passkey to create a new one.
            </p>
          </FtlMsg>
        )}
      </UnitRow>
    </>
  );
};

export default UnitRowPasskey;
