/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import AppLayout from '../../../components/AppLayout';
import Ready, { ReadyBaseIntegration } from '../../../components/Ready';
import { MozServices } from '../../../lib/types';

export type PrimaryEmailVerifiedProps = {
  serviceName?: MozServices;
  isSignedIn: boolean;
  integration?: ReadyBaseIntegration;
};

export const viewName = 'primary-email-verified';

const PrimaryEmailVerified = ({
  serviceName,
  isSignedIn,
  integration,
}: PrimaryEmailVerifiedProps & RouteComponentProps) => {
  const cmsInfo = integration?.getCmsInfo?.();

  return (
    <AppLayout cmsInfo={cmsInfo}>
      <Ready {...{ viewName, serviceName, isSignedIn, integration }} />
    </AppLayout>
  );
};

export default PrimaryEmailVerified;
