/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../../../components/CardHeader';
import { usePageViewEvent } from '../../../lib/metrics';
import { HeartsVerifiedImage } from '../../../components/images';
import { RemoteMetadata } from '../../../lib/types';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import Banner from '../../../components/Banner';

export const viewName = 'pair.auth.complete';

type AuthCompleteProps = {
  suppDeviceInfo: RemoteMetadata;
  supportsFirefoxView?: boolean;
  error?: string;
};

const AuthComplete = ({
  suppDeviceInfo,
  // FF View currently only supported in FF Nightly
  // value to be obtained from user agent browser version
  supportsFirefoxView = false,
  error,
}: AuthCompleteProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const { deviceFamily, deviceOS } = suppDeviceInfo;

  const handleSeeTabsButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    /**
     * TODO button functionality (below from auth_complete.js)
     * - logViewEvent('screen.pair.auth.fx-view', REACT_ENTRYPOINT);
     * - metrics.flush();
     * - const channel = this._notificationChannel;
     * - return channel.send(channel.COMMANDS.FIREFOX_VIEW, {entryPoint: 'preferences',});
     *   (entrypoint TBD)
     *  */
  };

  return (
    <AppLayout>
      <CardHeader
        headingTextFtlId="pair-auth-complete-heading"
        headingText="Device connected"
      />
      {/* TODO: Errors will need to be localized */}
      {error && <Banner type="error" content={{ localizedHeading: error }} />}
      {/* HeartsVerifiedImage was previously only shown if user agent supports SVG Transform Origin
         Current support is at 96.5% as of 02/2023: https://caniuse.com/mdn-css_properties_transform-origin_support_in_svg
         Non-animated version likely no longer necessary.
       */}
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
