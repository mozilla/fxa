/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import { PASSKEY_SUPPORT_URL } from './constants';

export const unsupportedPasskeyMessage = (): ReactNode => (
  <>
    <FtlMsg id="passkey-registration-error-not-supported-v2">
      <span>Your browser or device doesn’t support passkeys.</span>
    </FtlMsg>{' '}
    <FtlMsg id="passkey-registration-error-not-supported-link">
      <LinkExternal href={PASSKEY_SUPPORT_URL} className="link-blue">
        Learn more
      </LinkExternal>
    </FtlMsg>
  </>
);
