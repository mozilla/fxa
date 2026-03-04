/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../../../components/CardHeader';
import { usePageViewEvent } from '../../../lib/metrics';
import { HeartsVerifiedImage } from '../../../components/images';
import { RemoteMetadata } from '../../../lib/types';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import Banner from '../../../components/Banner';
import { Integration } from '../../../models';
import { PairingAuthorityIntegration } from '../../../models/integrations/pairing-authority-integration';

export const viewName = 'pair.auth.complete';

type AuthCompleteProps = {
  suppDeviceInfo?: RemoteMetadata;
  supportsFirefoxView?: boolean;
  error?: string;
  integration?: Integration;
};

const AuthComplete = ({
  suppDeviceInfo: suppDeviceInfoProp,
  // FF View currently only supported in FF Nightly
  // value to be obtained from user agent browser version
  supportsFirefoxView = false,
  error,
  integration,
}: AuthCompleteProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const [deviceInfo, setDeviceInfo] = useState<RemoteMetadata | undefined>(
    suppDeviceInfoProp
  );

  const deviceFamily = deviceInfo?.deviceFamily || 'Unknown';
  const deviceOS = deviceInfo?.deviceOS || 'Unknown';

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

  // Signal pairing complete to Firefox on mount
  useEffect(() => {
    if (integration instanceof PairingAuthorityIntegration) {
      integration.complete();
    }
    return () => {
      if (integration instanceof PairingAuthorityIntegration) {
        integration.destroy();
      }
    };
  }, [integration]);

  const handleSeeTabsButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: send FIREFOX_VIEW command when supported
    // firefox.send(FirefoxCommand.FirefoxView, { entryPoint: 'preferences' });
  };

  return (
    <AppLayout>
      <CardHeader
        headingTextFtlId="pair-auth-complete-heading"
        headingText="Device connected"
      />
      {error && <Banner type="error" content={{ localizedHeading: error }} />}
      <HeartsVerifiedImage className="w-3/5 mx-auto" />
      <FtlMsg
        id="pair-auth-complete-now-syncing-device-text"
        vars={{ deviceFamily: deviceFamily, deviceOS: deviceOS }}
      >
        <h2 className="my-4">
          {`You are now syncing with: ${deviceFamily} on ${deviceOS}`}
        </h2>
      </FtlMsg>
      <FtlMsg id="pair-auth-complete-sync-benefits-text">
        <p className="text-sm mb-4">
          Now you can access your open tabs, passwords, and bookmarks on all
          your devices.
        </p>
      </FtlMsg>
      {supportsFirefoxView ? (
        <FtlMsg id="pair-auth-complete-see-tabs-link">
          <button
            type="button"
            onClick={handleSeeTabsButtonClick}
            className="cta-primary cta-xl w-full"
          >
            See tabs from synced devices
          </button>
        </FtlMsg>
      ) : (
        <FtlMsg id="pair-auth-complete-manage-devices-link">
          <Link
            to="/settings#connected-services"
            className="cta-primary cta-xl w-full"
          >
            Manage devices
          </Link>
        </FtlMsg>
      )}
    </AppLayout>
  );
};

export default AuthComplete;
