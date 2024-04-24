/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeService {
  constructor() {}

  // TODO: this method should be moved down to the manager layer
  async customerChanged(uid: string, email: string) {
    // @todo - Unblocked by FXA-9274
    //const devices = await this.db.devices(uid);
    // @todo - Unblocked by FXA-9275
    //await this.profile.deleteCache(uid);
    // @todo - Unblocked by FXA-9276
    //await this.push.notifyProfileUpdated(uid, devices);
    // @todo - Unblocked by FXA-9277
    //this.log.notifyAttachedServices('profileDataChange', {} as any, {
    //  uid,
    //  email,
    //});
  }
}
