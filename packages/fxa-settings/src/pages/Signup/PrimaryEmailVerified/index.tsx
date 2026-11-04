/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ready from '../../../components/Ready';
import { MozServices } from '../../../lib/types';
import AppLayout from '../../../components/AppLayout';
import { ReadyBaseIntegration } from '../../../components/Ready';
import { useFtlMsgResolver } from '../../../models';

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
}: PrimaryEmailVerifiedProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const cmsInfo = integration?.getCmsInfo?.();
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'primary-email-verified-page-title',
    'Primary email confirmed'
  );

  return (
    <AppLayout cmsInfo={cmsInfo} title={localizedPageTitle}>
      <Ready {...{ viewName, serviceName, isSignedIn, integration }} />
    </AppLayout>
  );
};

export default PrimaryEmailVerified;
