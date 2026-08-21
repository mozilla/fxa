/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { useAccount } from '../../../../models';
import {
  AuthorityState,
  Integration,
  PairingAuthorityIntegration,
} from '../../../../models';
import { RemoteMetadata } from '../../../../lib/types';
import { navigateWithQuery } from '../../../../lib/utilities';
import ApproveSignIn from '.';
import { plog } from '../../../../lib/channels/pairing-flow';

/**
 * Authority approval container (FXA-13865 authority half).
 *
 * The channel and the supplicant's OAuth params live on
 * PairingAuthorityIntegration, which ScanQR created, so this page reads both
 * from the integration rather than owning any channel state itself.
 */
const ApproveSignInContainer = ({
  integration,
}: {
  integration: Integration;
}) => {
  const account = useAccount();
  const authority =
    integration instanceof PairingAuthorityIntegration ? integration : null;
  const req = authority?.supplicantOAuth ?? null;
  const remoteMetadata: RemoteMetadata = authority?.remoteMetadata ?? {
    deviceFamily: 'Mobile',
    deviceOS: '',
    ipAddress: '',
  };

  // If we landed here without a stored request the flow is out of sync; send the
  // user back to the QR rather than showing an empty approval.
  useEffect(() => {
    plog(
      'auth approve_signin mount; isAuthority?',
      !!authority,
      'have req?',
      !!req,
      'state',
      authority?.state ?? 'none'
    );
    if (!req || !authority) {
      plog('auth approve_signin has no request; back to scan_qr');
      navigateWithQuery('/pair/authority/scan_qr');
      return;
    }
    // ScanQR's state handler went with it on unmount, so take over routing:
    // a supplicant that cancels closes the channel, which fails the flow here.
    authority.onStateChange = (state: AuthorityState) => {
      if (state === AuthorityState.Failed) {
        navigateWithQuery('/pair/authority/timeout_and_cancel');
      }
    };

    // The supplicant is waiting on this before it can show its own
    // confirmation card, so send it as soon as this screen is up.
    authority
      .sendAuthorityMetadata({
        email: account.email,
        displayName: account.displayName ?? undefined,
        avatar: account.avatar?.url ?? undefined,
      })
      .catch(() => {
        // FXA-13869 owns the error surface.
      });
  }, [req, authority, account]);

  const onApprove = () => {
    if (!authority || !req) return;

    (async () => {
      try {
        // Advance to sync_success only once the supplicant reports it finished
        // the OAuth exchange. Attach before authorizing so the signal cannot
        // arrive before we are listening.
        authority.onSuppComplete = () => {
          navigateWithQuery('/pair/authority/sync_success');
        };

        const authorized = await authority.authorizeV2();
        if (!authorized) return;

        // Hand off to continue_on_mobile, which waits for the supplicant to
        // finish the OAuth exchange before showing success.
        navigateWithQuery('/pair/authority/continue_on_mobile');
      } catch {
        // FXA-13869 owns the error surface.
      }
    })();
  };

  const onChangePassword = () => {
    navigateWithQuery('/settings/change_password');
  };

  return (
    <ApproveSignIn
      email={account.email}
      {...{ remoteMetadata, onApprove, onChangePassword }}
    />
  );
};

export default ApproveSignInContainer;
