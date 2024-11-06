/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
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

export type AuthAllowProps = {
  suppDeviceInfo: RemoteMetadata;
  // TODO: In FXA-6639 - Listen to broken for error/success messages
  // included in props temporarily for tests/storybook
  bannerType?: 'success' | 'error';
  localizedBannerMessage?: string;
  email: string;
};

export const viewName = 'pair.auth.allow';

const handleSubmit = () => {
  GleanMetrics.cadApproveDevice.submit();
  // TODO: handle pairing authorization and catch errors in FXA-6639
};

const AuthAllow = ({
  suppDeviceInfo,
  bannerType,
  localizedBannerMessage,
  email,
}: AuthAllowProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const changePasswordLink = (
    <Link to="/reset_password" className="link-blue">
      change your password
    </Link>
  );

  return (
    <AppLayout>
      {/* Does not use CardHeader due to complication of passing vars */}
      <FtlMsg id="pair-auth-allow-heading-text">
        <h1 className="card-header">Did you just sign in to Firefox?</h1>
      </FtlMsg>
      <p className="card-subheader mb-2">{email}</p>
      {localizedBannerMessage && bannerType && (
        <Banner
          type={bannerType}
          content={{ localizedHeading: localizedBannerMessage }}
        />
      )}
      <LocationBalloonImage className="w-3/5 mx-auto mt-8" />
      <form noValidate onSubmit={handleSubmit}>
        <DeviceInfoBlock remoteMetadata={suppDeviceInfo} />
        <div className="flex flex-col justify-center">
          <FtlMsg id="pair-auth-allow-confirm-button">
            <button type="submit" className="cta-primary cta-xl w-full my-4">
              Yes, approve device
            </button>
          </FtlMsg>
          <FtlMsg
            id="pair-auth-allow-refuse-device-link"
            elems={{ link: changePasswordLink }}
          >
            <p className="text-xs">If this wasn't you, {changePasswordLink}</p>
          </FtlMsg>
        </div>
      </form>
    </AppLayout>
  );
};

export default AuthAllow;
