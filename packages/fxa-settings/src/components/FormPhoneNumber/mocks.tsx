/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FormPhoneNumber from '.';
import AppLayout from '../AppLayout';

export const Subject = () => {
  return (
    <AppLayout>
      <FormPhoneNumber localizedCTAText="Send code" />
    </AppLayout>
  );
};
