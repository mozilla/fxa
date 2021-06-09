/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fn, raw } from 'objection';
import { AuthBaseModel, Proc } from './auth-base';
import { Email } from './email';
import { Device } from './device';
import { uuidTransformer } from '../../transformers';
import { convertError } from '../../mysql';

export type AccountOptions = {
  include?: 'emails'[];
};

const selectFields = [
  'uid',
  'email',
  'emailVerified',
  'emailCode',
  'kA',
  'wrapWrapKb',
  'verifierVersion',
  'authSalt',
  'verifierSetAt',
  'createdAt',
  'locale',
  raw(
    'COALESCE(profileChangedAt, verifierSetAt, createdAt) AS profileChangedAt'
  ),
  raw('COALESCE(keysChangedAt, verifierSetAt, createdAt) AS keysChangedAt'),
  'ecosystemAnonId',
];

export class Account extends AuthBaseModel {
  static tableName = 'accounts';
  static idColumn = 'uid';

  protected $uuidFields = [
    'uid',
    'emailCode',
    'kA',
    'wrapWrapKb',
    'authSalt',
    'verifyHash',
  ];

  uid!: string;
  createdAt!: number;
  locale!: string;
  email!: string;
  emailVerified!: boolean;
  normalizedEmail!: string;
  emailCode!: string;
  primaryEmail?: Email;
  kA!: string;
  wrapWrapKb!: string;
  verifierVersion!: number;
  verifyHash?: string;
  authSalt!: string;
  verifierSetAt!: number;
  lockedAt!: number;
  profileChangedAt!: number;
  keysChangedAt!: number;
  ecosystemAnonId!: string;
  devices?: Device[];
  emails?: Email[];

  static relationMappings = {
    emails: {
      join: {
        from: 'accounts.uid',
        to: 'emails.uid',
      },
      modelClass: Email,
      relation: AuthBaseModel.HasManyRelation,
    },
    devices: {
      join: {
        from: 'accounts.uid',
        to: 'devices.uid',
      },
      modelClass: Device,
      relation: AuthBaseModel.HasManyRelation,
    },
  };

  static async create({
    uid,
    normalizedEmail,
    email,
    emailCode,
    emailVerified,
    kA,
    wrapWrapKb,
    authSalt,
    verifierVersion,
    verifyHash,
    verifierSetAt,
    createdAt,
    locale,
  }: Pick<
    Account,
    | 'uid'
    | 'normalizedEmail'
    | 'email'
    | 'emailCode'
    | 'emailVerified'
    | 'kA'
    | 'wrapWrapKb'
    | 'authSalt'
    | 'verifierVersion'
    | 'verifyHash'
    | 'verifierSetAt'
    | 'createdAt'
    | 'locale'
  >) {
    try {
      await Account.callProcedure(
        Proc.CreateAccount,
        uuidTransformer.to(uid),
        normalizedEmail,
        email,
        uuidTransformer.to(emailCode),
        emailVerified,
        uuidTransformer.to(kA),
        uuidTransformer.to(wrapWrapKb),
        uuidTransformer.to(authSalt),
        verifierVersion,
        uuidTransformer.to(verifyHash),
        verifierSetAt,
        createdAt,
        locale ?? ''
      );
    } catch (e) {
      throw convertError(e);
    }
  }

  static async delete(uid: string) {
    return Account.callProcedure(Proc.DeleteAccount, uuidTransformer.to(uid));
  }

  static async reset({
    uid,
    verifyHash,
    authSalt,
    wrapWrapKb,
    verifierSetAt,
    verifierVersion,
    keysHaveChanged,
  }: Pick<
    Account,
    | 'uid'
    | 'verifyHash'
    | 'authSalt'
    | 'wrapWrapKb'
    | 'verifierSetAt'
    | 'verifierVersion'
  > & {
    keysHaveChanged?: boolean;
  }) {
    return Account.callProcedure(
      Proc.ResetAccount,
      uuidTransformer.to(uid),
      uuidTransformer.to(verifyHash),
      uuidTransformer.to(authSalt),
      uuidTransformer.to(wrapWrapKb),
      verifierSetAt || Date.now(),
      verifierVersion,
      !!keysHaveChanged
    );
  }

  static async checkPassword(uid: string, verifyHash: string) {
    const count = await Account.query()
      .select('uid')
      .where('uid', uuidTransformer.to(uid))
      .andWhere('verifyHash', uuidTransformer.to(verifyHash))
      .resultSize();
    return count > 0;
  }

  static async findByPrimaryEmail(email: string) {
    let account: Account | null = null;
    const rows = await Account.callProcedure(Proc.AccountRecord, email);
    if (rows.length) {
      account = Account.fromDatabaseJson(rows[0]);
    }
    if (!account) {
      // There is a possibility that this email exists on the account table (ex. deleted from emails table)
      // Lets check before throwing account not found.
      account = await Account.query()
        .select(...selectFields)
        .where('normalizedEmail', fn.lower(email))
        .first();
      if (!account) {
        return null;
      }
    }
    account.emails = await Email.findByUid(account.uid);
    account.primaryEmail = account.emails?.find((email) => email.isPrimary);
    return account;
  }

  static async findByUid(uid: string, options?: AccountOptions) {
    const account = await Account.query()
      .select(...selectFields)
      .where('uid', uuidTransformer.to(uid))
      .first();
    if (!account) {
      return null;
    }
    // it's actually faster as separate queries
    if (options?.include?.includes('emails')) {
      account.emails = await Email.findByUid(uid);
      account.primaryEmail = account.emails?.find((email) => email.isPrimary);
    }
    return account;
  }
}
