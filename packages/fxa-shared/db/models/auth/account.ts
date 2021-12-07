/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import crypto from 'crypto';
import { fn, raw } from 'objection';
import { BaseAuthModel, Proc } from './base-auth';
import { Email } from './email';
import { Device } from './device';
import { intBoolTransformer, uuidTransformer } from '../../transformers';
import { convertError, notFound } from '../../mysql';

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
  'metricsOptOutAt',
  'disabledAt',
];

export class Account extends BaseAuthModel {
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
  disabledAt?: number;
  profileChangedAt!: number;
  keysChangedAt!: number;
  ecosystemAnonId!: string;
  metricsOptOutAt?: number;
  devices?: Device[];
  emails?: Email[];

  static relationMappings = {
    emails: {
      join: {
        from: 'accounts.uid',
        to: 'emails.uid',
      },
      modelClass: Email,
      relation: BaseAuthModel.HasManyRelation,
    },
    devices: {
      join: {
        from: 'accounts.uid',
        to: 'devices.uid',
      },
      modelClass: Device,
      relation: BaseAuthModel.HasManyRelation,
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
    } catch (e: any) {
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

  static async updateLocale(uid: string, locale: string) {
    await Account.query()
      .update({
        locale,
      })
      .where('uid', uuidTransformer.to(uid));
  }

  static async setPrimaryEmail(uid: string, email: string) {
    try {
      await Account.callProcedure(
        Proc.SetPrimaryEmail,
        uuidTransformer.to(uid),
        email
      );
    } catch (e: any) {
      e = convertError(e);
      if (e.errno === 101) {
        e.errno = 148;
        e.statusCode = 400;
      }
      throw e;
    }
  }

  static async createEmail({
    uid,
    normalizedEmail,
    email,
    emailCode,
    isVerified,
    verifiedAt,
  }: Pick<Account, 'uid' | 'normalizedEmail' | 'email' | 'emailCode'> & {
    isVerified: boolean;
    verifiedAt: number;
  }) {
    try {
      await Account.callProcedure(
        Proc.CreateEmail,
        normalizedEmail,
        email,
        uuidTransformer.to(uid),
        uuidTransformer.to(emailCode),
        intBoolTransformer.to(isVerified),
        verifiedAt ?? null,
        Date.now()
      );
    } catch (e: any) {
      throw convertError(e);
    }
  }

  static async verifyEmail(uid: string, emailCode: string) {
    try {
      await Account.callProcedure(
        Proc.VerifyEmail,
        uuidTransformer.to(uid),
        uuidTransformer.to(emailCode)
      );
    } catch (e: any) {
      throw convertError(e);
    }
  }

  static async deleteEmail(uid: string, email: string) {
    try {
      await Account.callProcedure(
        Proc.DeleteEmail,
        uuidTransformer.to(uid),
        email
      );
    } catch (e: any) {
      throw convertError(e);
    }
  }

  static async createUnblockCode(uid: string, code: string) {
    const id = uuidTransformer.to(uid);
    try {
      await Account.callProcedure(
        Proc.CreateUnblockCode,
        id,
        BaseAuthModel.sha256(Buffer.concat([id, Buffer.from(code, 'utf8')])),
        Date.now()
      );
    } catch (e: any) {
      throw convertError(e);
    }
  }

  static async consumeUnblockCode(uid: string, code: string) {
    const id = uuidTransformer.to(uid);
    try {
      const { rows } = await Account.callProcedure(
        Proc.ConsumeUnblockCode,
        id,
        BaseAuthModel.sha256(Buffer.concat([id, Buffer.from(code, 'utf8')]))
      );
      if (rows.length < 1 || !(rows[0] as any).createdAt) {
        throw notFound();
      }
      return rows[0];
    } catch (e: any) {
      throw convertError(e);
    }
  }

  static async createSigninCode(uid: string, code: string, flowId?: string) {
    try {
      await Account.callProcedure(
        Proc.CreateSigninCode,
        // hash of the utf8 string, not the decoded hex buffer :(
        crypto.createHash('sha256').update(code).digest(),
        uuidTransformer.to(uid),
        Date.now(),
        flowId ? uuidTransformer.to(flowId) : null
      );
    } catch (e: any) {
      throw convertError(e);
    }
  }

  static async consumeSigninCode(code: string, maxAge: number = 172800000) {
    const newerThan = Date.now() - maxAge;
    try {
      const { rows } = await Account.callProcedure(
        Proc.ConsumeSigninCode,
        // hash of the utf8 string, not the decoded hex buffer :(
        crypto.createHash('sha256').update(code).digest(),
        newerThan
      );
      if (rows.length < 1) {
        throw notFound();
      }
      const row = rows[0] as { flowId: Buffer; email: string };
      return {
        flowId: uuidTransformer.from(row.flowId),
        email: row.email,
      };
    } catch (e: any) {
      throw convertError(e);
    }
  }

  static async resetTokens(uid: string) {
    try {
      await Account.callProcedure(
        Proc.ResetAccountTokens,
        uuidTransformer.to(uid)
      );
    } catch (e: any) {
      throw convertError(e);
    }
  }

  static async replaceRecoveryCodes(
    uid: string,
    hashes: { hash: Buffer; salt: Buffer }[]
  ) {
    try {
      const id = uuidTransformer.to(uid);
      await Account.transaction(async (txn) => {
        await Account.callProcedure(Proc.DeleteRecoveryCodes, txn, id);
        for (const { hash, salt } of hashes) {
          await Account.callProcedure(
            Proc.CreateRecoveryCode,
            txn,
            id,
            hash,
            salt
          );
        }
      });
    } catch (e: any) {
      throw convertError(e);
    }
  }

  static async consumeRecoveryCode(
    uid: string,
    codeChecker: (hash: Buffer, salt: Buffer) => Promise<boolean>
  ) {
    try {
      const id = uuidTransformer.to(uid);
      const { rows } = await Account.callProcedure(Proc.RecoveryCodes, id);
      for (const row of rows) {
        const matches = await codeChecker(row.codeHash, row.salt);
        if (matches) {
          const {
            rows: [result],
          } = await Account.callProcedure(
            Proc.ConsumeRecoveryCode,
            id,
            row.codeHash
          );
          return result.count as number;
        }
      }
      throw notFound();
    } catch (e: any) {
      throw convertError(e);
    }
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
    const { rows } = await Account.callProcedure(Proc.AccountRecord, email);
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

  static async setMetricsOpt(
    uid: string,
    state: 'in' | 'out',
    timestamp: number = Date.now()
  ) {
    await Account.query()
      .update({
        metricsOptOutAt: state === 'out' ? timestamp : null,
        profileChangedAt: Date.now(),
      })
      .where('uid', uuidTransformer.to(uid));
  }

  static async metricsEnabled(uid: string) {
    try {
      const { metricsOptOutAt } = await Account.query()
        .select('metricsOptOutAt')
        .where('uid', uuidTransformer.to(uid))
        .first();
      return !metricsOptOutAt;
    } catch (error) {
      // err on caution / don't throw
      return false;
    }
  }
}
