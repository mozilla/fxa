/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import { RemoteMetadata } from '../../../lib/types';
import { usePageViewEvent } from '../../../lib/metrics';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';
import { FtlMsg } from 'fxa-react/lib/utils';
import GleanMetrics from '../../../lib/glean';
import Banner from '../../../components/Banner';
import { Integration } from '../../../models';
import {
  PairingSupplicantIntegration,
  SupplicantState,
} from '../../../models/integrations/pairing-supplicant-integration';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';

export type SuppAllowProps = {
  authDeviceInfo?: RemoteMetadata;
  email?: string;
  integration?: Integration;
};

export const viewName = 'pair.supp.allow';

const SuppAllow = ({
  authDeviceInfo: authDeviceInfoProp,
  email: emailProp,
  integration,
}: SuppAllowProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const navigateWithQuery = useNavigateWithQuery();
  const [error, setError] = useState<string>();
  const [authDeviceInfo, setAuthDeviceInfo] = useState<
    RemoteMetadata | undefined
  >(authDeviceInfoProp);

  // Get supplicant integration if available
  const suppIntegration =
    integration instanceof PairingSupplicantIntegration
      ? integration
      : undefined;

  // Read email from integration or URL params as fallback
  const urlParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );
  const email =
    emailProp || suppIntegration?.email || urlParams.get('email') || '';

  // Populate device info from integration's remote metadata
  useEffect(() => {
    if (authDeviceInfoProp) return;
    if (suppIntegration?.remoteMetadata) {
      setAuthDeviceInfo(suppIntegration.remoteMetadata);
    }
  }, [authDeviceInfoProp, suppIntegration]);

  // Listen for state changes to navigate after approval
  useEffect(() => {
    if (!suppIntegration) return;

    // Check if we already missed a state transition (timing gap between pages)
    const currentState = suppIntegration.state;
    if (currentState === SupplicantState.WaitingForSupplicant) {
      // Authority already approved — stay on this page, user still needs to click Confirm
    } else if (currentState === SupplicantState.Complete) {
      const clientId = urlParams.get('client_id') || '';
      navigateWithQuery(`/oauth/success/${clientId}`);
      return;
    }

    suppIntegration.onStateChange = (state: SupplicantState) => {
      if (state === SupplicantState.Complete) {
        // Navigate to OAuth success page
        const clientId = urlParams.get('client_id') || '';
        navigateWithQuery(`/oauth/success/${clientId}`);
      } else if (state === SupplicantState.WaitingForAuthority) {
        // Supplicant approved, waiting for authority
        navigateWithQuery('/pair/supp/wait_for_auth');
      } else if (state === SupplicantState.Failed) {
        setError(
          suppIntegration.error?.message || 'An error occurred during pairing'
        );
      }
    };

    suppIntegration.onError = (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'An error occurred during pairing';
      setError(message);
    };

    return () => {
      suppIntegration.onStateChange = null;
      suppIntegration.onError = null;
    };
  }, [suppIntegration, navigateWithQuery, urlParams]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      GleanMetrics.cadMobilePair.submit();
      if (suppIntegration) {
        suppIntegration.supplicantApprove().catch((err: unknown) => {
          const message =
            err instanceof Error
              ? err.message
              : 'An error occurred during pairing';
          setError(message);
        });
      }
    },
    [suppIntegration]
  );

  const spanElement: ReactElement = (
    <span className="card-subheader">for {email}</span>
  );

  return (
    <AppLayout>
      {/* Does not use CardHeader due to complication of passing vars within elems */}
      <FtlMsg
        id="pair-supp-allow-heading-text"
        elems={{ span: spanElement }}
        vars={{ email: email || '' }}
      >
        <h1 className="card-header">Confirm pairing {spanElement}</h1>
      </FtlMsg>
      {error && <Banner type="error" content={{ localizedHeading: error }} />}
      <form noValidate onSubmit={handleSubmit}>
        {authDeviceInfo && <DeviceInfoBlock remoteMetadata={authDeviceInfo} />}
        <div className="flex flex-col justify-center">
          <FtlMsg id="pair-supp-allow-confirm-button">
            <button type="submit" className="cta-primary cta-xl w-full">
              Confirm pairing
            </button>
          </FtlMsg>
          <FtlMsg id="pair-supp-allow-cancel-link">
            <Link
              to="/pair/failure"
              className="link-grey mt-4 text-sm text-center"
            >
              Cancel
            </Link>
          </FtlMsg>
        </div>
      </form>
    </AppLayout>
  );
};

export default SuppAllow;
