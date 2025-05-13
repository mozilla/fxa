/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import ChooseNewsletters from '.';
import { newsletters } from './newsletters';

export const SubjectWithNewsletters = () => {
  const [, setSelected] = useState<string[]>([]);

  const newsletters = [
    {
      label: 'Early access to test new products',
      slug: ['test-pilot'],
      ftlId: 'choose-newsletters-option-test-pilot',
    },
  ];
  return (
    <ChooseNewsletters
      {...{ newsletters }}
      setSelectedNewsletterSlugs={setSelected}
    />
  );
};

export const SubjectWithNone = () => {
  const [, setSelected] = useState<string[]>([]);

  return (
    <ChooseNewsletters
      {...{ newsletters }}
      setSelectedNewsletterSlugs={setSelected}
    />
  );
};
