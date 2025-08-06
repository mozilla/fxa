/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InlineRecoveryKeySetupCreate, { InlineRecoveryKeySetupCreateProps } from '.';
import AppLayout from '../AppLayout';

export const Subject = (props: Partial<InlineRecoveryKeySetupCreateProps>) => (
  <AppLayout>
    <InlineRecoveryKeySetupCreate
      createRecoveryKeyHandler={() =>
        Promise.resolve({
          data: {
            recoveryKey: new Uint8Array(20),
          },
        })
      }
      doLaterHandler={() => Promise.resolve()}
      {...props}
    />
  </AppLayout>
);
