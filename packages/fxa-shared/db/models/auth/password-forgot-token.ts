/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseAuthModel, Proc } from './base-auth';
import { uuidTransformer } from '../../transformers';
import {
  VerificationMethod,
  verificationMethodToNumber,
} from './session-token';

export class PasswordForgotToken extends BaseAuthModel {
  public static tableName = 'passwordForgotTokens';
  public static idColumn = 'tokenId';

  protected $uuidFields = ['tokenData', 'uid', 'passCode'];

  // table fields
  tokenData!: string;
  uid!: string;
  createdAt!: number;
  passCode!: string;
  tries!: number;
  verificationMethod!: number;

  // joined fields (from passwordForgotToken_# stored proc)
  email!: string;
  verifierSetAt!: number;

  static async create({
    id,
    data,
    uid,
    passCode,
    createdAt,
    tries,
  }: Pick<PasswordForgotToken, 'uid' | 'createdAt' | 'passCode' | 'tries'> & {
    id: string;
    data: string;
  }) {
    return PasswordForgotToken.callProcedure(
      Proc.CreatePasswordForgotToken,
      uuidTransformer.to(id),
      uuidTransformer.to(data),
      uuidTransformer.to(uid),
      uuidTransformer.to(passCode),
      createdAt,
      tries
    );
  }

  static async update(id: string, tries: number) {
    await PasswordForgotToken.query()
      .update({ tries })
      .where('tokenId', uuidTransformer.to(id));
  }

  static async verify(
    id: string,
    resetToken: {
      uid: string;
      id: string;
      data: string;
      createdAt: number;
      verificationMethod: VerificationMethod | number;
    }
  ) {
    return PasswordForgotToken.callProcedure(
      Proc.ForgotPasswordVerified,
      uuidTransformer.to(id),
      uuidTransformer.to(resetToken.id),
      uuidTransformer.to(resetToken.data),
      uuidTransformer.to(resetToken.uid),
      resetToken.createdAt,
      resetToken.verificationMethod
    );
  }

  static async delete(id: string) {
    return PasswordForgotToken.callProcedure(
      Proc.DeletePasswordForgotToken,
      uuidTransformer.to(id)
    );
  }

  static async findByTokenId(id: string) {
    const { rows } = await PasswordForgotToken.callProcedure(
      Proc.PasswordForgotToken,
      uuidTransformer.to(id)
    );
    if (!rows.length) {
      return null;
    }
    return PasswordForgotToken.fromDatabaseJson(rows[0]);
  }

  static async updateVerificationMethod(
    id: string,
    method: VerificationMethod | number
  ) {
    await PasswordForgotToken.query()
      .update({ verificationMethod: verificationMethodToNumber(method) })
      .where('tokenId', uuidTransformer.to(id));
  }
}
