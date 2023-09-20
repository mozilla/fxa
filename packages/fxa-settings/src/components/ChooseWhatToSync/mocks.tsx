/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import ChooseWhatToSync from '.';
import { engines } from './sync-engines';

export const Subject = () => {
  const initialList: string[] = engines
    .filter((engine) => engine.defaultChecked)
    .map((engine) => engine.text);
  const [, setSelected] = useState<string[]>(initialList);

  return <ChooseWhatToSync {...{ engines }} setSelectedEngines={setSelected} />;
};
