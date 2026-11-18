/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ready from '../../../components/Ready';
import { MozServices } from '../../../lib/types';
import AppLayout from '../../../components/AppLayout';
import { Integration, useFtlMsgResolver } from '../../../models';

type SigninConfirmedProps = {
  continueHandler?: Function;
  isSignedIn: boolean;
  serviceName?: MozServices;
  integration?: Integration;
};

export const viewName = 'signin-confirmed';

const SigninConfirmed = ({
  continueHandler,
  isSignedIn,
  serviceName,
  integration,
}: SigninConfirmedProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const cmsInfo = integration?.getCmsInfo?.();
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'sign-in-complete-page-title',
    'Sign-in confirmed'
  );

  return (
    <AppLayout cmsInfo={cmsInfo} title={localizedPageTitle}>
      <Ready
        {...{ continueHandler, isSignedIn, viewName, serviceName, integration }}
      />
    </AppLayout>
  );
};

export default SigninConfirmed;
