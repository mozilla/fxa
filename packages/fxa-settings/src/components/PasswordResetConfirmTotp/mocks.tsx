/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import AppLayout from '../AppLayout';
import PasswordResetConfirmTotp, { PasswordResetConfirmTotpProps } from '.';

export const Subject = ({
  codeLength = 6,
  onComplete = async () => {},
}: Partial<PasswordResetConfirmTotpProps> & {
  success?: Boolean;
  initialErrorMessage?: string;
}) => {
  return (
    <AppLayout>
      <PasswordResetConfirmTotp
        codeLength={codeLength}
        onComplete={onComplete}
      />
    </AppLayout>
  );
};

export default Subject;
