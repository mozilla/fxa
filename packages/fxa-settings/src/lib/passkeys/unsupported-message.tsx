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
      <LinkExternal href={PASSKEY_TROUBLESHOOT_URL} className="link-blue">
        Learn more
      </LinkExternal>
    </FtlMsg>
  </>
);

/**
 * Shown when the passkey ceremony is cancelled or times out — covers the
 * in-page Cancel link, the AbortError surfaced by our timeout wrapper, and
 * the TimeoutError raised by browsers that distinguish it. NotAllowedError
 * is NOT routed here: WebAuthn conflates cancel with UV failure and other
 * denials behind that DOMException, so it falls through to the generic
 * categorizer fallback — see PagePasskeyAdd dispatcher. Matches the Figma
 * spec for FXA-13805 / FXA-13806.
 */
export const passkeyCanceledOrTimedOutMessage = (): ReactNode => (
  <>
    <FtlMsg id="passkey-registration-canceled-v2">
      <span>Passkey setup timed out or was cancelled.</span>
    </FtlMsg>{' '}
    <FtlMsg id="passkey-registration-canceled-link">
      <LinkExternal href={PASSKEY_TROUBLESHOOT_URL} className="link-blue">
        Learn more
      </LinkExternal>
    </FtlMsg>
  </>
);
