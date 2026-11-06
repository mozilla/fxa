/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ready, { ReadyBaseIntegration } from '../../../components/Ready';
import AppLayout from '../../../components/AppLayout';
import { MozServices } from '../../../lib/types';
import { useFtlMsgResolver } from '../../../models';

type SignupConfirmedProps = {
  continueHandler?: Function;
  isSignedIn: boolean;
  serviceName?: MozServices;
  integration?: ReadyBaseIntegration;
};

export const viewName = 'signup-confirmed';

const SignupConfirmed = ({
  continueHandler,
  isSignedIn,
  serviceName,
  integration,
}: SignupConfirmedProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const cmsInfo = integration?.getCmsInfo?.();
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'sign-up-complete-page-title',
    'Account confirmed'
  );

  return (
    <AppLayout cmsInfo={cmsInfo} title={localizedPageTitle}>
      <Ready
        {...{ continueHandler, isSignedIn, viewName, serviceName, integration }}
      />
    </AppLayout>
  );
};

export default SignupConfirmed;
