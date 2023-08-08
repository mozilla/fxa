/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import ChooseNewsletters from '.';
import { newsletters } from './newsletters';

export const Subject = () => {
  const [, setSelected] = useState<string[]>([]);

  return (
    <ChooseNewsletters
      {...{ newsletters }}
      setSelectedNewsletterSlugs={setSelected}
    />
  );
};
