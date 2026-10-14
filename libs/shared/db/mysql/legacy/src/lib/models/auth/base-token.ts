/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { convertError, notFound } from '../../mysql';
import { uuidTransformer } from '../../transformers';
import { BaseAuthModel, Proc } from './base-auth';

export class BaseToken extends BaseAuthModel {
  static async verifyToken(uid: string, verificationId: string) {
    try {
      const { status } = await BaseToken.callProcedure(
        Proc.VerifyToken,
        uuidTransformer.to(verificationId),
        uuidTransformer.to(uid)
      );
      if (status.affectedRows < 1) {
        throw notFound();
      }
    } catch (e) {
      throw convertError(e);
    }
  }
}
