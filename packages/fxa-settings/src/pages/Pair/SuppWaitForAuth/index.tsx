/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import { RemoteMetadata } from '../../../lib/types';
import { usePageViewEvent } from '../../../lib/metrics';
import CardHeader from '../../../components/CardHeader';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';
import Banner from '../../../components/Banner';
import {
  PairingSupplicantIntegration,
  SupplicantState,
} from '../../../models/integrations/pairing-supplicant-integration';
import { Integration } from '../../../models/integrations/integration';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';

export type SuppWaitForAuthProps = {
  authDeviceInfo?: RemoteMetadata;
  error?: string;
  integration?: Integration;
};

export const viewName = 'pair.supp.wait-for-auth';

const SuppWaitForAuth = ({
  authDeviceInfo: authDeviceInfoProp,
  error,
  integration,
}: SuppWaitForAuthProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const navigateWithQuery = useNavigateWithQuery();

  // Narrow to PairingSupplicantIntegration for pairing-specific methods
  const pairingIntegration =
    integration instanceof PairingSupplicantIntegration
      ? integration
      : undefined;

  // Get device info from integration
  const authDeviceInfo =
    authDeviceInfoProp || pairingIntegration?.remoteMetadata;

  // Navigate to success, check current state AND listen for future changes
  useEffect(() => {
    if (!pairingIntegration) {
      return;
    }

    const navigateToSuccess = () => {
      const clientId = pairingIntegration.getClientId() || '';
      navigateWithQuery(`/oauth/success/${clientId}`);
    };

    // Check if we already missed the state transition (timing gap between pages)
    const currentState = pairingIntegration.state;
    if (currentState === SupplicantState.Complete) {
      navigateToSuccess();
      return;
    }

    pairingIntegration.onStateChange = (state: SupplicantState) => {
      if (state === SupplicantState.Complete) {
        navigateToSuccess();
      } else if (state === SupplicantState.Failed) {
        navigateWithQuery('/pair/failure');
      }
    };

    pairingIntegration.onError = () => {
      navigateWithQuery('/pair/failure');
    };

    return () => {
      pairingIntegration.onStateChange = null;
      pairingIntegration.onError = null;
    };
  }, [pairingIntegration, navigateWithQuery]);

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
