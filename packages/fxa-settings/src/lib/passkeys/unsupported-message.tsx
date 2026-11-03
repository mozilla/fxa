/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import { PASSKEY_TROUBLESHOOT_URL } from './constants';

export const unsupportedPasskeyMessage = (): ReactNode => (
  <>
    <FtlMsg id="passkey-registration-error-not-supported-v2">
      <span>Your browser or device doesn’t support passkeys.</span>
    </FtlMsg>{' '}
    <FtlMsg id="passkey-registration-error-not-supported-link">
      <LinkExternal
        href={PASSKEY_TROUBLESHOOT_URL}
        className="link-blue"
        gleanDataAttrs={{ id: 'account_pref_passkey_unsupported_learn_more' }}
      >
        Learn more
      </LinkExternal>
    </FtlMsg>
  </>
);

export const passkeyCanceledOrTimedOutMessage = (): ReactNode => (
  <>
    <FtlMsg id="passkey-registration-canceled-v2">
      <span>Passkey setup timed out or was cancelled.</span>
    </FtlMsg>{' '}
    <FtlMsg id="passkey-registration-canceled-link">
      <LinkExternal
        href={PASSKEY_TROUBLESHOOT_URL}
        className="link-blue"
        gleanDataAttrs={{
          id: 'account_pref_passkey_create_canceled_learn_more',
        }}
      >
        Learn more
      </LinkExternal>
    </FtlMsg>
  </>
);

export const passkeyCouldNotCompleteMessage = (): ReactNode => (
  <>
    <FtlMsg id="passkey-registration-error-could-not-complete">
      <span>
        Passkey setup couldn’t be completed. Try a different method or device.
      </span>
    </FtlMsg>{' '}
    <FtlMsg id="passkey-registration-error-could-not-complete-link">
      <LinkExternal
        href={PASSKEY_TROUBLESHOOT_URL}
        className="link-blue"
        gleanDataAttrs={{ id: 'account_pref_passkey_create_failed_learn_more' }}
      >
        Learn more
      </LinkExternal>
    </FtlMsg>
  </>
);
