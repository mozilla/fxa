/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link, RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactElement } from 'react';
import AppLayout from '../../../components/AppLayout';
import Banner from '../../../components/Banner';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';
import { REACT_ENTRYPOINT } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import { usePageViewEvent } from '../../../lib/metrics';
import { RemoteMetadata } from '../../../lib/types';

export type SuppAllowProps = {
  authDeviceInfo: RemoteMetadata;
  // TODO: In FXA-6638 - Listen to broken for error/success messages
  // included in props temporarily for tests/storybook
  bannerType?: 'success' | 'error';
  bannerMessage?: string;
  email: string;
};

// TODO: verify if this event exists or needs to be added
// this event is not currently included in amplitude.js
export const viewName = 'pair.supp.allow';

const handleSubmit = () => {
  GleanMetrics.cadMobilePair.submit();
  // TODO: handle pairing authorization and catch errors in FXA-6638
};

const SuppAllow = ({
  authDeviceInfo,
  bannerType,
  bannerMessage,
  email,
}: SuppAllowProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const spanElement: ReactElement = (
    <span className="card-subheader">for {email}</span>
  );

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
      {bannerType && bannerMessage && (
        <Banner
          type={bannerType}
          content={{ localizedHeading: bannerMessage }}
        />
      )}
      <form noValidate onSubmit={handleSubmit}>
        <DeviceInfoBlock remoteMetadata={authDeviceInfo} />
        <div className="flex flex-col justify-center">
          <FtlMsg id="pair-supp-allow-confirm-button">
            <button type="submit" className="cta-primary cta-xl w-full">
              Confirm pairing
            </button>
          </FtlMsg>
          <FtlMsg id="pair-supp-allow-cancel-link">
            <Link to="/pair/failure" className="link-grey mt-4 text-sm">
              Cancel
            </Link>
          </FtlMsg>
        </div>
      </form>
    </AppLayout>
  );
};

export default SuppAllow;
