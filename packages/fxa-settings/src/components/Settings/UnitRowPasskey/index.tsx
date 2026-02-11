/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import UnitRow, { UnitRowProps } from '../UnitRow';
import { useFtlMsgResolver } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { PasskeySubRow } from '../SubRow';

// TODO: Update with actual passkey data types when available
export type Passkey = {
  id: string;
  name: string;
  createdAt: number;
  lastUsed?: number;
  canSync: boolean;
};

export type UnitRowPasskeyProps = {
  passkeys?: Passkey[];
};

export const UnitRowPasskey = ({ passkeys = [] }: UnitRowPasskeyProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const hasPasskeys = passkeys.length > 0;

  const conditionalUnitRowProps: Partial<UnitRowProps> = hasPasskeys
    ? {
        statusIcon: 'checkmark',
        headerValue: ftlMsgResolver.getMsg('passkey-row-enabled', 'Enabled'),
      }
    : {
        statusIcon: 'alert',
        defaultHeaderValueText: ftlMsgResolver.getMsg(
          'passkey-row-not-set',
          'Not Set'
        ),
      };

  const getSubRows = () => {
    return passkeys.map((passkey) => (
      <PasskeySubRow key={passkey.id} passkey={passkey} />
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
        route="/settings/passkeys/add"
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
