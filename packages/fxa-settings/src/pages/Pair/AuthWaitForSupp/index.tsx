/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement } from 'react';
import { RouteComponentProps } from '@reach/router';
import { RemoteMetadata } from '../../../lib/types';
import { usePageViewEvent } from '../../../lib/metrics';
import CardHeader from '../../../components/CardHeader';
import Banner, { BannerType } from '../../../components/Banner';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';

export type BannerMessage = {
  messageType: BannerType;
  messageElement: ReactElement;
};

export type AuthWaitForSuppProps = {
  suppDeviceInfo: RemoteMetadata;
  // Listen to broken for error/success messages
  // included in props temporarily for tests/storybook
  bannerMessage?: BannerMessage;
};

export const viewName = 'pair.auth.wait-for-supp';

const AuthWaitForSupp = ({
  suppDeviceInfo,
  bannerMessage,
}: AuthWaitForSuppProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const {
    deviceName,
    browserName,
    genericOSName,
    ipAddress,
    city,
    region,
    country,
  } = suppDeviceInfo;

  return (
    <AppLayout>
      <CardHeader
        headingText="Approval now required"
        headingTextFtlId="pair-wait-for-auth-heading-text"
        subheadingText="from your other device"
      />
      {bannerMessage && (
        <Banner type={bannerMessage.messageType}>
          {bannerMessage.messageElement}
        </Banner>
      )}

      <DeviceInfoBlock
        {...{
          deviceName,
          browserName,
          genericOSName,
          ipAddress,
          city,
          region,
          country,
        }}
      />
    </AppLayout>
  );
};

export default AuthWaitForSupp;
