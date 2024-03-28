/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { convertError, notFound } from '../../mysql';
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
      await this.transaction(async (txn) => {
        await this.callProcedure(
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
            await this.callProcedure(
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
      await this.transaction(async (txn) => {
        const { status } = await this.callProcedure(
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
          await this.callProcedure(
            Proc.PurgeAvailableCommands,
            txn,
            uuidTransformer.to(uid),
            uuidTransformer.to(id)
          );
          for (const [commandName, commandData] of Object.entries(
            availableCommands
          )) {
            await this.callProcedure(
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
    } = await this.callProcedure(
      Proc.DeleteDevice,
      uuidTransformer.to(uid),
      uuidTransformer.to(id)
    );
    if (!result) {
      throw notFound();
    }
    return {
      sessionTokenId: uuidTransformer.from(result.sessionTokenId),
      refreshTokenId: uuidTransformer.from(result.refreshTokenId),
    };
  }

  static fromRows(rows: object[]): Device[] {
    return aggregateNameValuePairs(
      rows,
      'id',
      'commandName',
      'commandData',
      'availableCommands'
    ).map((row) => this.fromDatabaseJson(row));
  }

  static async findByUid(uid: string, limit = 500) {
    const { rows } = await this.callProcedure(
      Proc.AccountDevices,
      uuidTransformer.to(uid),
      limit
    );
    return this.fromRows(rows);
  }

  static async findByPrimaryKey(uid: string, id: string) {
    const { rows } = await this.callProcedure(
      Proc.Device,
      uuidTransformer.to(uid),
      uuidTransformer.to(id)
    );
    return this.fromRows(rows).shift() || null;
  }

  static async findByUidAndTokenVerificationId(
    uid: string,
    tokenVerificationId: string
  ) {
    const { rows } = await this.callProcedure(
      Proc.DeviceFromTokenVerificationId,
      uuidTransformer.to(uid),
      uuidTransformer.to(tokenVerificationId)
    );
    return this.fromRows(rows).shift() || null;
  }

  static async findDeviceIdByUidAndSessionId(
    uid: string,
    sessionTokenId: string
  ) {
    const device = await Device.query()
      .select('id')
      .where('uid', uuidTransformer.to(uid))
      .where('sessionTokenId', uuidTransformer.to(sessionTokenId))
      .first();

    return device ? device.id : null;
  }

  static async findDeviceIdByUidAndRefreshTokenId(
    uid: string,
    refreshTokenId: string
  ) {
    const device = await Device.query()
      .select('id')
      .where('uid', uuidTransformer.to(uid))
      .where('refreshTokenId', uuidTransformer.to(refreshTokenId))
      .first();

    return device ? device.id : null;
  }
}
