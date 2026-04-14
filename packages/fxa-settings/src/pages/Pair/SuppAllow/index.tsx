/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { RemoteMetadata } from '../../../lib/types';
import { usePageViewEvent } from '../../../lib/metrics';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';
import { FtlMsg } from 'fxa-react/lib/utils';
import GleanMetrics from '../../../lib/glean';
import Banner from '../../../components/Banner';
import {
  PairingSupplicantIntegration,
  SupplicantState,
} from '../../../models/integrations/pairing-supplicant-integration';
import { Integration } from '../../../models/integrations/integration';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';

export type SuppAllowProps = {
  authDeviceInfo?: RemoteMetadata;
  email?: string;
  integration?: Integration;
  error?: string;
};

export const viewName = 'pair.supp.allow';

const SuppAllow = ({
  authDeviceInfo: authDeviceInfoProp,
  email: emailProp,
  integration,
  error,
}: SuppAllowProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  useEffect(() => {
    GleanMetrics.cadMobilePair.view();
  }, []);
  const navigateWithQuery = useNavigateWithQuery();
  const [authDeviceInfo, setAuthDeviceInfo] = useState<
    RemoteMetadata | undefined
  >(authDeviceInfoProp);

  // Narrow to PairingSupplicantIntegration for pairing-specific methods
  const pairingIntegration =
    integration instanceof PairingSupplicantIntegration
      ? integration
      : undefined;

  const email = emailProp || pairingIntegration?.email || '';
  const clientId = pairingIntegration?.getClientId() || '';

  // Populate device info from integration's remote metadata
  useEffect(() => {
    if (authDeviceInfoProp) {
      return;
    }
    if (pairingIntegration?.remoteMetadata) {
      setAuthDeviceInfo(pairingIntegration.remoteMetadata);
    }
  }, [authDeviceInfoProp, pairingIntegration]);

  // Listen for state changes to navigate after approval
  useEffect(() => {
    if (!pairingIntegration) {
      return;
    }

    // Handle the case where we already missed a state transition
    // (timing gap between pages). If Complete, jump straight to success;
    // if WaitingForSupplicant, the authority already approved and we
    // remain here until the user clicks Confirm.
    if (pairingIntegration.state === SupplicantState.Complete) {
      navigateWithQuery(`/oauth/success/${clientId}`);
      return;
    }

    pairingIntegration.onStateChange = (state: SupplicantState) => {
      if (state === SupplicantState.Complete) {
        navigateWithQuery(`/oauth/success/${clientId}`);
      } else if (state === SupplicantState.WaitingForAuthority) {
        // Supplicant approved, waiting for authority
        navigateWithQuery('/pair/supp/wait_for_auth');
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
  }, [pairingIntegration, navigateWithQuery, clientId]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      GleanMetrics.cadMobilePair.submit();
      if (pairingIntegration) {
        pairingIntegration.supplicantApprove().catch(() => {
          navigateWithQuery('/pair/failure');
        });
      }
    },
    [pairingIntegration, navigateWithQuery]
  );

  const handleCancel = useCallback(async () => {
    if (pairingIntegration) {
      await pairingIntegration.destroy();
    }
    navigateWithQuery('/pair/failure');
  }, [pairingIntegration, navigateWithQuery]);

  const spanElement = <span className="card-subheader">for {email}</span>;

  return (
    <AppLayout>
      {/* Does not use CardHeader due to complication of passing vars within elems */}
      <FtlMsg
        id="pair-supp-allow-heading-text"
        elems={{ span: spanElement }}
        vars={{ email }}
      >
        <h1 className="card-header">Confirm pairing {spanElement}</h1>
      </FtlMsg>
      {error && <Banner type="error" content={{ localizedHeading: error }} />}
      <form noValidate onSubmit={handleSubmit}>
        {authDeviceInfo && <DeviceInfoBlock remoteMetadata={authDeviceInfo} />}
        <div className="flex flex-col justify-center">
          <FtlMsg id="pair-supp-allow-confirm-button">
            <button
              type="submit"
              id="supp-approve-btn"
              data-testid="pair-supp-approve-btn"
              className="cta-primary cta-xl w-full"
            >
              Confirm pairing
            </button>
          </FtlMsg>
          <FtlMsg id="pair-supp-allow-cancel-link">
            <button
              type="button"
              onClick={handleCancel}
              className="link-grey mt-4 text-sm text-center"
            >
              Cancel
            </button>
          </FtlMsg>
        </div>
      </form>
    </AppLayout>
  );
};

export default SuppAllow;
