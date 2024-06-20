/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import DataBlock, { DataBlockProps } from '.';
import { MOCK_EMAIL } from '../../pages/mocks';

export const Subject = ({
  value = 'ANMD 1S09 7Y2Y 4EES 02CW BJ6Z PYKP H69F',
  ...props // overrides
}: Partial<DataBlockProps> = {}) => (
  <DataBlock email={MOCK_EMAIL} {...{ value, ...props }} />
);
