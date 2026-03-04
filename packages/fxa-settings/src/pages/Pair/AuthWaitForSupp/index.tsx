/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { RemoteMetadata } from '../../../lib/types';
import { usePageViewEvent } from '../../../lib/metrics';
import CardHeader from '../../../components/CardHeader';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';
import Banner from '../../../components/Banner';
import { Integration } from '../../../models';
import { PairingAuthorityIntegration } from '../../../models/integrations/pairing-authority-integration';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';

export type AuthWaitForSuppProps = {
  suppDeviceInfo?: RemoteMetadata;
  error?: string;
  integration?: Integration;
};

export const viewName = 'pair.auth.wait-for-supp';

const AuthWaitForSupp = ({
  suppDeviceInfo: suppDeviceInfoProp,
  error: errorProp,
  integration,
}: AuthWaitForSuppProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const navigateWithQuery = useNavigateWithQuery();
  const [error, setError] = useState(errorProp);
  const [deviceInfo, setDeviceInfo] = useState<RemoteMetadata | undefined>(
    suppDeviceInfoProp
  );

  // Fetch supplicant metadata if not provided via props
  useEffect(() => {
    if (suppDeviceInfoProp) return;
    if (integration instanceof PairingAuthorityIntegration) {
      integration
        .getSupplicantMetadata()
        .then(setDeviceInfo)
        .catch(() => {});
    }
  }, [integration, suppDeviceInfoProp]);

  useEffect(() => {
    if (!(integration instanceof PairingAuthorityIntegration)) {
      return;
    }

    integration.onSuppAuthorized = () => {
      navigateWithQuery('/pair/auth/complete');
    };

    integration.onHeartbeatError = (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Connection lost';
      setError(message);
    };

    integration.startHeartbeat();

    return () => {
      integration.stopHeartbeat();
      integration.onSuppAuthorized = null;
      integration.onHeartbeatError = null;
    };
  }, [integration, navigateWithQuery]);

  return (
    <AppLayout>
      <CardHeader
        headingText="Approval now required"
        headingAndSubheadingFtlId="pair-wait-for-supp-heading-text"
        subheadingText="from your other device"
      />
      {error && <Banner type="error" content={{ localizedHeading: error }} />}

      {deviceInfo && <DeviceInfoBlock remoteMetadata={deviceInfo} />}
    </AppLayout>
  );
};

export default AuthWaitForSupp;
