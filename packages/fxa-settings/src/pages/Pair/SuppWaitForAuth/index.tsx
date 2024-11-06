/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { RemoteMetadata } from '../../../lib/types';
import { usePageViewEvent } from '../../../lib/metrics';
import CardHeader from '../../../components/CardHeader';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';
import Banner from '../../../components/Banner';

export type SuppWaitForAuthProps = {
  authDeviceInfo: RemoteMetadata;
  // Listen to broken for error/success messages
  // included in props temporarily for tests/storybook
  bannerType?: 'success' | 'error';
  bannerMessage?: string;
};

export const viewName = 'pair.supp.wait-for-auth';

const SuppWaitForAuth = ({
  authDeviceInfo,
  bannerMessage,
  bannerType,
}: SuppWaitForAuthProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  return (
    <AppLayout>
      <CardHeader
        headingText="Approval now required"
        headingAndSubheadingFtlId="pair-wait-for-auth-heading-text"
        subheadingText="from your other device"
      />
      {bannerType && bannerMessage && (
        <Banner
          type={bannerType}
          content={{ localizedHeading: bannerMessage }}
        />
      )}

      <DeviceInfoBlock remoteMetadata={authDeviceInfo} />
    </AppLayout>
  );
};

export default SuppWaitForAuth;
