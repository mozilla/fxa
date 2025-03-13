/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { convertError } from '../../mysql';
import { uuidTransformer } from '../../transformers';
import { BaseAuthModel, Proc } from './base-auth';

export class RecoveryCodes extends BaseAuthModel {
  public static tableName = 'recoveryCodes';
  public static idColumn = 'id';

  protected $uuidFields = ['uid', 'codeHash', 'salt'];

  // table fields
  id!: number;
  uid!: string;
  codeHash!: string;
  salt!: string;

  /**
   * Creates a new recovery code entry for a user.
   *
   * This method hashes the plain text code using BaseAuthModel.sha256
   * and calls the stored procedure for inserting a recovery code.
   *
   * @param uid - The user's uid.
   * @param code - The plain text recovery code.
   * @param salt - The salt value (a 32-byte binary value).
   */
  static async create({
    uid,
    code,
    salt,
  }: {
    uid: string;
    code: string;
    salt: string;
  }): Promise<void> {
    try {
      await RecoveryCodes.callProcedure(
        Proc.CreateRecoveryCode, // maps to createRecoveryCode_3
        uuidTransformer.to(uid),
        BaseAuthModel.sha256(code),
        salt
      );
    } catch (e) {
      throw convertError(e);
    }
  }

  /**
   * Deletes all recovery codes for a given user.
   *
   * Calls the stored procedure that deletes all recovery codes for the uid.
   *
   * @param uid - The user's uid.
   */
  static async delete(uid: string): Promise<void> {
    try {
      await RecoveryCodes.callProcedure(
        Proc.DeleteRecoveryCodes, // maps to deleteRecoveryCodes_1
        uuidTransformer.to(uid)
      );
    } catch (e) {
      throw convertError(e);
    }
  }

  /**
   * Consumes a recovery code for a user.
   *
   * The provided recovery code (after being hashed) is removed via a stored procedure.
   * The updated procedure no longer uses ROW_COUNT() and instead returns a count of the remaining recovery codes.
   *
   * @param uid - The user's uid.
   * @param code - The plain text recovery code to be consumed.
   * @returns The count of remaining recovery codes for the user.
   */
  static async consume({
    uid,
    code,
  }: {
    uid: string;
    code: string;
  }): Promise<number> {
    try {
      const { rows } = await RecoveryCodes.callProcedure(
        Proc.ConsumeRecoveryCode, // now maps to consumeRecoveryCode_3
        uuidTransformer.to(uid),
        BaseAuthModel.sha256(code)
      );
      // The procedure returns a row with a "count" column.
      return rows[0].count;
    } catch (e) {
      throw convertError(e);
    }
  }

  /**
   * Retrieves all recovery code records for a user.
   *
   * Calls the stored procedure that selects recovery codes for the uid.
   *
   * @param uid - The user's uid.
   * @returns An array of RecoveryCodes instances, or null if none exist.
   */
  static async findByUid(uid: string): Promise<RecoveryCodes[] | null> {
    try {
      const { rows } = await RecoveryCodes.callProcedure(
        Proc.RecoveryCodes, // maps to recoveryCodes_1
        uuidTransformer.to(uid)
      );
      if (!rows.length) {
        return null;
      }
      return rows.map((row: any) => RecoveryCodes.fromDatabaseJson(row));
    } catch (e) {
      throw convertError(e);
    }
  }
}
