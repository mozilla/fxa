/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { convertError, MysqlErrors, notFound } from '../../mysql';
import {
  aggregateNameValuePairs,
  intBoolTransformer,
  uuidTransformer,
} from '../../transformers';
import { BaseAuthModel, Proc } from './base-auth';

export class Device extends BaseAuthModel {
  static tableName = 'devices';
  static idColumn = ['uid', 'id'];

  protected $uuidFields = ['id', 'uid', 'sessionTokenId', 'refreshTokenId'];
  protected $intBoolFields = ['callbackIsExpired'];

  // table fields
  id!: string;
  uid!: string;
  sessionTokenId!: string;
  name?: string;
  type?: string;
  createdAt?: number;
  pushCallback?: string;
  pushPublicKey?: string;
  pushAuthKey?: string;
  callbackIsExpired!: boolean;
  refreshTokenId?: string;

  // joined fields (from accountDevices_# stored proc)
  uaBrowser?: string;
  uaBrowserVersion?: string;
  uaOS?: string;
  uaOSVersion?: string;
  uaDeviceType?: string;
  uaFormFactor?: string;
  lastAccessTime?: string;

  // generated
  availableCommands!: {
    [key: string]: string;
  };

  static async create({
    id,
    uid,
    sessionTokenId,
    refreshTokenId,
    name,
    type,
    createdAt,
    pushCallback,
    pushPublicKey,
    pushAuthKey,
    availableCommands,
  }: Pick<
    Device,
    | 'id'
    | 'uid'
    | 'sessionTokenId'
    | 'refreshTokenId'
    | 'name'
    | 'type'
    | 'createdAt'
  > & {
    pushCallback?: string;
    pushPublicKey?: string;
    pushAuthKey?: string;
    availableCommands?: {
      [key: string]: string;
    };
  }) {
    try {
      await Device.transaction(async (txn) => {
        await Device.callProcedure(
          Proc.CreateDevice,
          txn,
          uuidTransformer.to(uid),
          uuidTransformer.to(id),
          sessionTokenId ? uuidTransformer.to(sessionTokenId) : null,
          refreshTokenId ? uuidTransformer.to(refreshTokenId) : null,
          name ?? null,
          type ?? null,
          createdAt,
          pushCallback ?? null,
          pushPublicKey ?? null,
          pushAuthKey ?? null
        );
        if (availableCommands) {
          for (const [commandName, commandData] of Object.entries(
            availableCommands
          )) {
            await Device.callProcedure(
              Proc.UpsertAvailableCommands,
              txn,
              uuidTransformer.to(uid),
              uuidTransformer.to(id),
              commandName,
              commandData
            );
          }
        }
      });
    } catch (e) {
      throw convertError(e);
    }
  }

  static async update({
    id,
    uid,
    sessionTokenId,
    refreshTokenId,
    name,
    type,
    pushCallback,
    pushPublicKey,
    pushAuthKey,
    callbackIsExpired,
    availableCommands,
  }: Pick<
    Device,
    | 'id'
    | 'uid'
    | 'sessionTokenId'
    | 'refreshTokenId'
    | 'name'
    | 'type'
    | 'pushCallback'
    | 'pushPublicKey'
    | 'pushAuthKey'
    | 'callbackIsExpired'
  > & {
    availableCommands?: {
      [key: string]: string;
    };
  }) {
    try {
      await Device.transaction(async (txn) => {
        const { status } = await Device.callProcedure(
          Proc.UpdateDevice,
          txn,
          uuidTransformer.to(uid),
          uuidTransformer.to(id),
          sessionTokenId ? uuidTransformer.to(sessionTokenId) : null,
          refreshTokenId ? uuidTransformer.to(refreshTokenId) : null,
          name ?? null,
          type ?? null,
          pushCallback ?? null,
          pushPublicKey ?? null,
          pushAuthKey ?? null,
          intBoolTransformer.to(callbackIsExpired)
        );
        if (status.affectedRows < 1) {
          throw notFound();
        }
        if (availableCommands) {
          await Device.callProcedure(
            Proc.PurgeAvailableCommands,
            txn,
            uuidTransformer.to(uid),
            uuidTransformer.to(id)
          );
          for (const [commandName, commandData] of Object.entries(
            availableCommands
          )) {
            await Device.callProcedure(
              Proc.UpsertAvailableCommands,
              txn,
              uuidTransformer.to(uid),
              uuidTransformer.to(id),
              commandName,
              commandData
            );
          }
        }
      });
    } catch (e) {
      throw convertError(e);
    }
  }

  static async delete(uid: string, id: string) {
    const {
      rows: [result],
    } = await Device.callProcedure(
      Proc.DeleteDevice,
      uuidTransformer.to(uid),
      uuidTransformer.to(id)
    );
    if (!result) {
      throw notFound();
    }
    return result;
  }

  static fromRows(rows: object[]): Device[] {
    return aggregateNameValuePairs(
      rows,
      'id',
      'commandName',
      'commandData',
      'availableCommands'
    ).map((row) => Device.fromDatabaseJson(row));
  }

  static async findByUid(uid: string) {
    const { rows } = await Device.callProcedure(
      Proc.AccountDevices,
      uuidTransformer.to(uid)
    );
    return Device.fromRows(rows);
  }

  static async findByPrimaryKey(uid: string, id: string) {
    const { rows } = await Device.callProcedure(
      Proc.Device,
      uuidTransformer.to(uid),
      uuidTransformer.to(id)
    );
    return Device.fromRows(rows).shift() || null;
  }

  static async findByUidAndTokenVerificationId(
    uid: string,
    tokenVerificationId: string
  ) {
    const { rows } = await Device.callProcedure(
      Proc.DeviceFromTokenVerificationId,
      uuidTransformer.to(uid),
      uuidTransformer.to(tokenVerificationId)
    );
    return Device.fromRows(rows).shift() || null;
  }
}
