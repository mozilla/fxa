/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import ChooseWhatToSync from '.';
import { syncEngineConfigs } from './sync-engines';

export const Subject = () => {
  const [, setDeclined] = useState<string[]>([]);

  return (
    <ChooseWhatToSync
      offeredSyncEngineConfigs={syncEngineConfigs}
      setDeclinedSyncEngines={setDeclined}
    />
  );
};
