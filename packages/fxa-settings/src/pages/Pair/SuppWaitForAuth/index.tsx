/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useMemo, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { RemoteMetadata } from '../../../lib/types';
import { usePageViewEvent } from '../../../lib/metrics';
import CardHeader from '../../../components/CardHeader';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';
import Banner from '../../../components/Banner';
import { Integration } from '../../../models';
import {
  PairingSupplicantIntegration,
  SupplicantState,
} from '../../../models/integrations/pairing-supplicant-integration';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';

export type SuppWaitForAuthProps = {
  authDeviceInfo?: RemoteMetadata;
  error?: string;
  integration?: Integration;
};

export const viewName = 'pair.supp.wait-for-auth';

const SuppWaitForAuth = ({
  authDeviceInfo: authDeviceInfoProp,
  error: errorProp,
  integration,
}: SuppWaitForAuthProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const navigateWithQuery = useNavigateWithQuery();
  const [error, setError] = useState<string | undefined>(errorProp);

  const suppIntegration =
    integration instanceof PairingSupplicantIntegration
      ? integration
      : undefined;

  // Get device info from integration
  const authDeviceInfo = authDeviceInfoProp || suppIntegration?.remoteMetadata;

  const urlParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );

  // Navigate to success — check current state AND listen for future changes
  useEffect(() => {
    if (!suppIntegration) return;

    const navigateToSuccess = () => {
      const clientId = urlParams.get('client_id') || '';
      navigateWithQuery(`/oauth/success/${clientId}`);
    };

    // Check if we already missed the state transition (timing gap between pages)
    const currentState = suppIntegration.state;
    if (currentState === SupplicantState.Complete) {
      navigateToSuccess();
      return;
    }

    suppIntegration.onStateChange = (state: SupplicantState) => {
      if (state === SupplicantState.Complete) {
        navigateToSuccess();
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

  return (
    <AppLayout>
      <CardHeader
        headingText="Approval now required"
        headingAndSubheadingFtlId="pair-wait-for-auth-heading-text"
        subheadingText="from your other device"
      />
      {error && <Banner type="error" content={{ localizedHeading: error }} />}

      {authDeviceInfo && <DeviceInfoBlock remoteMetadata={authDeviceInfo} />}
    </AppLayout>
  );
};

export default SuppWaitForAuth;
