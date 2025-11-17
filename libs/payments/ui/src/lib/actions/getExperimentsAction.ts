/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { getApp } from '../nestapp/app';
import { getIpAddress } from '../utils/getIpAddress';
import { headers } from 'next/headers';

export const getExperimentsAction = async (args: {
  experimentationPreview: boolean;
  language: string;
  fxaUid?: string;
}) => {
  const ip = getIpAddress();
  const experimentationId = headers().get('x-experimentation-id') || '';

  try {
    const experiments = await getApp()
      .getActionsService()
      .getExperiments({
        ...args,
        ip,
        experimentationId,
      });

    return experiments?.experiments;
  } catch (error) {
    return undefined;
  }
};
