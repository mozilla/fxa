/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import AppLayout from '../../../components/AppLayout';
import Banner from '../../../components/Banner';
import CardHeader from '../../../components/CardHeader';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';
import { REACT_ENTRYPOINT } from '../../../constants';
import { usePageViewEvent } from '../../../lib/metrics';
import { RemoteMetadata } from '../../../lib/types';

export type AuthWaitForSuppProps = {
  suppDeviceInfo: RemoteMetadata;
  // Listen to broken for error/success messages
  // included in props temporarily for tests/storybook
  bannerType?: 'success' | 'error';
  localizedBannerMessage?: string;
};

export const viewName = 'pair.auth.wait-for-supp';

const AuthWaitForSupp = ({
  suppDeviceInfo,
  bannerType,
  localizedBannerMessage,
}: AuthWaitForSuppProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  return (
    <AppLayout>
      <CardHeader
        headingText="Approval now required"
        headingAndSubheadingFtlId="pair-wait-for-supp-heading-text"
        subheadingText="from your other device"
      />
      {bannerType && localizedBannerMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedBannerMessage }}
        />
      )}

      <DeviceInfoBlock remoteMetadata={suppDeviceInfo} />
    </AppLayout>
  );
};

export default AuthWaitForSupp;
