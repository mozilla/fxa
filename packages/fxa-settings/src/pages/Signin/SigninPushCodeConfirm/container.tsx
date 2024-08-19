/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps } from '@reach/router';
import { MozServices } from '../../../lib/types';
import { Integration, useAuthClient } from '../../../models';
import SigninPushCodeConfirm from './index';

export type SigninPushCodeConfirmContainerProps = {
  integration: Integration;
  serviceName: MozServices;
};

export const SigninPushCodeConfirmContainer = ({
  serviceName,
}: SigninPushCodeConfirmContainerProps & RouteComponentProps) => {
  return (
    <SigninPushCodeConfirm
      authDeviceInfo={{
        deviceName: 'MacBook Pro',
        deviceFamily: 'Firefox',
        deviceOS: 'macOS',
        ipAddress: '127.0.0.1',
        country: 'Ireland',
        city: 'Dublin',
      }}
      email={'a@aa.com'}
    />
  );
};

export default SigninPushCodeConfirmContainer;
