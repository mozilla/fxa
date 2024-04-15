/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use server';

import { app } from '../nestapp/app';
import { plainToClass } from 'class-transformer';
import { SetupCartActionArgs } from '../nestapp/validators/SetupCartActionArgs';

export const setupCartAction = async (
  interval: string,
  offeringConfigId: string,
  experiment?: string,
  promoCode?: string,
  uid?: string,
  ip?: string
) => {
  const actionsService = await app.getActionsService();

  await actionsService.setupCart(
    plainToClass(SetupCartActionArgs, {
      interval,
      offeringConfigId,
      experiment,
      promoCode,
      uid,
      ip,
    })
  );
};
