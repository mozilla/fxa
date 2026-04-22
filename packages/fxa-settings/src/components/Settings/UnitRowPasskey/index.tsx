/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import UnitRow, { UnitRowProps } from '../UnitRow';
import { useAccount, useFtlMsgResolver, useConfig } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { PasskeySubRow } from '../SubRow';
import { isWebAuthnLevel3Supported } from '../../../lib/passkeys/webauthn';
import { Banner } from '../../Banner';

export const UnitRowPasskey = () => {
  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const config = useConfig();
  const maxPasskeys = config.passkeys.maxPerUser;
  const passkeys = account.passkeys;
  const hasPasskeys = passkeys.length > 0;
  const isAtLimit = passkeys.length >= maxPasskeys;
  const webAuthnSupported = isWebAuthnLevel3Supported();
  const [showWebAuthnError, setShowWebAuthnError] = useState(false);

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

  const getSubRows = () => (
    <>
      {showWebAuthnError && (
        <Banner
          type="error"
          className="mb-2"
          content={{
            localizedDescription: ftlMsgResolver.getMsg(
              'passkey-row-webauthn-not-supported',
              'Your browser or device doesn’t support passkeys.'
            ),
          }}
        />
      )}
      {webAuthnSupported && isAtLimit && (
        <Banner
          type="warning"
          className="mb-2"
          content={{
            localizedDescription: ftlMsgResolver.getMsg(
              'passkey-row-max-limit-banner',
              `You’ve used all ${maxPasskeys} passkeys. Delete a passkey to create a new one.`,
              { count: maxPasskeys }
            ),
          }}
        />
      )}
      {passkeys.map((passkey) => (
        <PasskeySubRow key={passkey.credentialId} passkey={passkey} />
      ))}
    </>
  );

  const learnMoreLink = (
    <FtlMsg id="passkey-row-info-link-2">
      <LinkExternal
        href="https://support.mozilla.org/kb/placeholder-article" // TODO: Update with actual support article link
        className="link-blue text-sm"
      >
        Learn more
      </LinkExternal>
    </FtlMsg>
  );

  return (
    <UnitRow
      header={ftlMsgResolver.getMsg('passkey-row-header', 'Passkeys')}
      headerId="passkeys"
      prefixDataTestId="passkey"
      ctaText={ftlMsgResolver.getMsg('passkey-row-action-create', 'Create')}
      route={
        webAuthnSupported && !isAtLimit ? '/settings/passkeys/add' : undefined
      }
      revealModal={
        !webAuthnSupported ? () => setShowWebAuthnError(true) : undefined
      }
      disabled={webAuthnSupported && isAtLimit}
      disabledReason={ftlMsgResolver.getMsg(
        'passkey-row-max-limit-disabled-reason',
        "You've reached the maximum number of passkeys."
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
    </UnitRow>
  );
};

export default UnitRowPasskey;
