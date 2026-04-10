/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import UnitRow, { UnitRowProps } from '../UnitRow';
import { useFtlMsgResolver, useConfig } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { PasskeySubRow, PasskeyRowData } from '../SubRow';
import { Banner } from '../../Banner';

export type UnitRowPasskeyProps = {
  passkeys?: PasskeyRowData[];
};

export const UnitRowPasskey = ({ passkeys = [] }: UnitRowPasskeyProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const config = useConfig();
  const maxPasskeys = config.passkeys.maxPerUser;
  const hasPasskeys = passkeys.length > 0;
  const isAtLimit = passkeys.length >= maxPasskeys;

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
      {isAtLimit && (
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
        <PasskeySubRow key={passkey.id} passkey={passkey} />
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
    <>
      <UnitRow
        header={ftlMsgResolver.getMsg('passkey-row-header', 'Passkeys')}
        headerId="passkeys"
        prefixDataTestId="passkey"
        ctaText={ftlMsgResolver.getMsg('passkey-row-action-create', 'Create')}
        route="/settings/passkeys/add"
        disabled={isAtLimit}
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
    </>
  );
};

export default UnitRowPasskey;
