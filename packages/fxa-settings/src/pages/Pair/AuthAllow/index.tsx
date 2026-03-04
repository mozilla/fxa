/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
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
import { Integration } from '../../../models';
import { firefox } from '../../../lib/channels/firefox';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';

// pair/auth/allow is the authority approval page.
// When the user clicks "Yes, approve device", it sends the PAIR_AUTHORIZE
// WebChannel command to Firefox, which completes the authority side of pairing.
//
// URL format: /pair/auth/allow?client_id=...&email=...&channel_id=...

export type AuthAllowProps = {
  suppDeviceInfo?: RemoteMetadata;
  email?: string;
  integration?: Integration;
};

export const viewName = 'pair.auth.allow';

function getUrlParam(key: string): string {
  return new URLSearchParams(window.location.search).get(key) || '';
}

const AuthAllow = ({
  suppDeviceInfo: suppDeviceInfoProp,
  email: emailProp,
  integration,
}: AuthAllowProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const navigateWithQuery = useNavigateWithQuery();
  const [error, setError] = useState<string>();
  const [suppDeviceInfo, setSuppDeviceInfo] = useState<
    RemoteMetadata | undefined
  >(suppDeviceInfoProp);

  // Read email from URL params as fallback
  const email = emailProp || getUrlParam('email');
  const channelId = getUrlParam('channel_id');

  // Validate client_id against pairing allowlist (matching Backbone behavior)
  useEffect(() => {
    if (!(integration instanceof PairingAuthorityIntegration)) return;
    if (!integration.validatePairingClient()) {
      setError('Invalid pairing client');
    }
  }, [integration]);

  // Try to fetch supplicant metadata in the background (non-blocking)
  useEffect(() => {
    if (suppDeviceInfoProp) return;
    if (!(integration instanceof PairingAuthorityIntegration)) return;

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
    (e: React.FormEvent) => {
      e.preventDefault();
      GleanMetrics.cadApproveDevice.submit();
      try {
        if (integration instanceof PairingAuthorityIntegration) {
          integration.authorize();
        } else if (channelId) {
          // Fallback: call WebChannel directly
          firefox.pairAuthorize(channelId);
        }
        navigateWithQuery('/pair/auth/wait_for_supp');
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'An error occurred during pairing';
        setError(message);
      }
    },
    [integration, channelId, navigateWithQuery]
  );

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
            <button type="submit" className="cta-primary cta-xl w-full my-4">
              Yes, approve device
            </button>
          </FtlMsg>
          <FtlMsg
            id="pair-auth-allow-refuse-device-link"
            elems={{
              a: <Link to="/reset_password" className="link-blue" />,
            }}
          >
            <p className="text-xs">
              If this wasn't you,{' '}
              <Link to="/reset_password" className="link-blue">
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
