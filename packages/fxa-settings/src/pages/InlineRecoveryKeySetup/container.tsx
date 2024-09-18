/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { Integration } from '../../models';
import { RouteComponentProps } from '@reach/router';
import InlineRecoveryKeySetup from '.';

export const InlineRecoveryKeySetupContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  const [currentStep] = useState<number>(1);
  const createRecoveryKeyHandler = useCallback(async () => {
    // TODO in FXA-10079
  }, []);

  return (
    <InlineRecoveryKeySetup {...{ createRecoveryKeyHandler, currentStep }} />
  );
};

export default InlineRecoveryKeySetupContainer;
