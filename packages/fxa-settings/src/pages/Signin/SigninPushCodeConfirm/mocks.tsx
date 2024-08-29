/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SigninPushCodeConfirm, { SigninPushCodeConfirmProps } from '.';

export const Subject = ({
  authDeviceInfo,
  sessionVerified,
  isLoading,
}: Partial<SigninPushCodeConfirmProps>) => {
  return (
    <SigninPushCodeConfirm
      sessionVerified={sessionVerified || false}
      isLoading={isLoading || false}
      handleSubmit={() => {}}
      authDeviceInfo={
        authDeviceInfo || {
          deviceName: 'MacBook Pro',
          deviceFamily: 'Device Family',
          deviceOS: 'Device OS',
          ipAddress: '123.123.123.123',
          city: 'City',
          region: 'Region',
          country: 'Country',
        }
      }
    />
  );
};
