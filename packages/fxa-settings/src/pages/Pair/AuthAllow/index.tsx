/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { RemoteMetadata } from '../../../lib/types';
import { usePageViewEvent } from '../../../lib/metrics';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactComponent as LocationBalloonImage } from './confirm-pairing.svg';
import GleanMetrics from '../../../lib/glean';
import Banner from '../../../components/Banner';
import { PairingAuthorityIntegration } from '../../../models/integrations/pairing-authority-integration';
import { Integration, useAuthClient } from '../../../models';
import { firefox, SignedInUser } from '../../../lib/channels/firefox';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import {
  getPairingAuthorityAccount,
  getPairingChannelId,
  isPairingTotpVerified,
} from '../../../lib/pairing-authority';
import { getPairingErrorMessage } from '../../../lib/utilities';
import AuthenticationMethods from '../../../constants/authentication-methods';

// pair/auth/allow is the authority approval page.
// When the user clicks "Yes, approve device", it sends the PAIR_AUTHORIZE
// WebChannel command to Firefox, which completes the authority side of pairing.
//
// URL format: /pair/auth/allow?client_id=...&email=...&channel_id=...

export type AuthAllowProps = {
  suppDeviceInfo?: RemoteMetadata;
  email?: string;
  integration?: Integration;
  error?: string;
  /**
   * Storybook-only stand-in for the browser account, which is otherwise read
   * over the WebChannel. The route never passes it, so production always goes
   * through {@link getPairingAuthorityAccount}.
   */
  authorityAccount?: SignedInUser;
};

export const viewName = 'pair.auth.allow';

function getUrlParam(key: string): string {
  return new URLSearchParams(window.location.search).get(key) || '';
}

const AuthAllow = ({
  suppDeviceInfo: suppDeviceInfoProp,
  email: emailProp,
  integration,
  error: errorProp,
  authorityAccount,
}: AuthAllowProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  useEffect(() => {
    GleanMetrics.cadApproveDevice.view();
  }, []);
  const navigateWithQuery = useNavigateWithQuery();
  const authClient = useAuthClient();
  const [error, setError] = useState<string | undefined>(errorProp);
  const [approvalAllowed, setApprovalAllowed] = useState(false);
  const [browserEmail, setBrowserEmail] = useState<string | undefined>();
  const [suppDeviceInfo, setSuppDeviceInfo] = useState<
    RemoteMetadata | undefined
  >(suppDeviceInfoProp);

  // Prefer the browser's account: it is the one being paired. Props are for
  // Storybook, and the URL param is a last-resort fallback.
  const email = browserEmail || emailProp || getUrlParam('email');
  const channelId = getPairingChannelId();

  // TOTP gate. This is the only second-factor check standing between someone
  // at an unlocked, signed-in Firefox and a persistent Sync device on the
  // account, so every unknown outcome cancels pairing rather than rendering
  // the approve button (FXA-14194).
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const account = authorityAccount ?? (await getPairingAuthorityAccount());
      if (cancelled) {
        return;
      }
      if (!account?.sessionToken) {
        // Backbone parity (pairing-totp-mixin cancelPairingWithError): with no
        // signed-in browser account there is nothing to approve with.
        navigateWithQuery('/pair/failure');
        return;
      }
      setBrowserEmail(account.email);

      let accountHasTotp: boolean;
      try {
        // Mirror Backbone: 'otp' is in AMR only when TOTP is verified AND enabled.
        const { authenticationMethods } = await authClient.accountProfile(
          account.sessionToken
        );
        accountHasTotp = !!authenticationMethods?.includes(
          AuthenticationMethods.OTP
        );
      } catch {
        // Fail closed. Approving without knowing the TOTP status would let a
        // blocked profile request skip the second factor entirely.
        if (!cancelled) {
          navigateWithQuery('/pair/failure');
        }
        return;
      }
      if (cancelled) {
        return;
      }

      if (accountHasTotp && !isPairingTotpVerified(channelId)) {
        navigateWithQuery('/pair/auth/totp');
        return;
      }
      setApprovalAllowed(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [authClient, navigateWithQuery, channelId, authorityAccount]);

  // Validate client_id against pairing allowlist (matching Backbone behavior)
  useEffect(() => {
    if (!(integration instanceof PairingAuthorityIntegration)) {
      return;
    }
    if (!integration.validatePairingClient()) {
      setError('Invalid pairing client');
    }
  }, [integration]);

  // Try to fetch supplicant metadata in the background (non-blocking)
  useEffect(() => {
    if (suppDeviceInfoProp) {
      return;
    }
    if (!(integration instanceof PairingAuthorityIntegration)) {
      return;
    }

    let cancelled = false;
    integration
      .getSupplicantMetadata()
      .then((metadata) => {
        if (!cancelled) setSuppDeviceInfo(metadata);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [integration, suppDeviceInfoProp]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      // Defense in depth: the form is only rendered once the gate passes, but
      // authorizing must never be reachable while it hasn't.
      if (!approvalAllowed) {
        return;
      }
      GleanMetrics.cadApproveDevice.submit();
      try {
        if (integration instanceof PairingAuthorityIntegration) {
          await integration.authorize();
        } else if (channelId) {
          // Fallback: call WebChannel directly
          await firefox.pairAuthorize(channelId);
        }
        navigateWithQuery('/pair/auth/wait_for_supp');
      } catch (err: unknown) {
        setError(getPairingErrorMessage(err));
      }
    },
    [approvalAllowed, integration, channelId, navigateWithQuery]
  );

  // Don't render the approval page until the TOTP gate passes. A blocked gate
  // navigates away, so this also covers the moment before the redirect lands.
  if (!approvalAllowed) {
    return <AppLayout loading />;
  }

  return (
    <AppLayout>
      {/* Does not use CardHeader due to complication of passing vars */}
      <FtlMsg id="pair-auth-allow-heading-text">
        <h1 className="card-header">Did you just sign in to Firefox?</h1>
      </FtlMsg>
      <p className="card-subheader mb-2">{email}</p>
      {error && <Banner type="error" content={{ localizedHeading: error }} />}
      <LocationBalloonImage className="w-3/5 mx-auto mt-8" />
      <form noValidate onSubmit={handleSubmit}>
        {suppDeviceInfo && <DeviceInfoBlock remoteMetadata={suppDeviceInfo} />}
        <div className="flex flex-col justify-center">
          <FtlMsg id="pair-auth-allow-confirm-button">
            <button
              type="submit"
              data-testid="pair-auth-approve-btn"
              className="cta-primary cta-xl w-full my-4"
            >
              Yes, approve device
            </button>
          </FtlMsg>
          <FtlMsg
            id="pair-auth-allow-refuse-device-link"
            elems={{
              a: <Link to="/settings/change_password" className="link-blue" />,
            }}
          >
            <p className="text-xs">
              If this wasn't you,{' '}
              <Link to="/settings/change_password" className="link-blue">
                change your password
              </Link>
            </p>
          </FtlMsg>
        </div>
      </form>
    </AppLayout>
  );
};

export default AuthAllow;
