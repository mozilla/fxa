/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthorizedClientsFactory,
  ConnectedServicesCache,
  ConnectedServicesDb,
  mergeDevicesAndSessionTokens,
} from 'fxa-shared/connected-services';
import {
  Account,
  Device,
  Email,
  EmailBounce,
  RecoveryKey,
  SecurityEvent,
  SessionToken,
  TotpToken,
} from 'fxa-shared/db/models/auth';
import { MysqlStoreShared } from 'fxa-shared/db/mysql';
import { RedisShared } from 'fxa-shared/db/redis';
import { Knex, knex } from 'knex';

import { AppConfig } from '../config';

function typeCasting(field: any, next: any) {
  if (field.type === 'TINY' && field.length === 1) {
    return field.string() === '1';
  }
  return next();
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  public knex: Knex;
  public account: typeof Account;
  public emails: typeof Email;
  public emailBounces: typeof EmailBounce;
  public securityEvents: typeof SecurityEvent;
  public totp: typeof TotpToken;
  public recoveryKeys: typeof RecoveryKey;
  public sessionTokens: typeof SessionToken;
  public device: typeof Device;

  protected connectedServicesDb: ConnectedServicesDb;

  constructor(configService: ConfigService<AppConfig>) {
    const dbConfig = configService.get('database') as AppConfig['database'];
    const redisConfig = configService.get('redis') as AppConfig['redis'];

    this.knex = knex({
      connection: { typeCast: typeCasting, ...dbConfig.fxa },
      client: 'mysql',
    });
    this.account = Account.bindKnex(this.knex);
    this.emails = Email.bindKnex(this.knex);
    this.emailBounces = EmailBounce.bindKnex(this.knex);
    this.securityEvents = SecurityEvent.bindKnex(this.knex);
    this.totp = TotpToken.bindKnex(this.knex);
    this.recoveryKeys = RecoveryKey.bindKnex(this.knex);
    this.sessionTokens = SessionToken.bindKnex(this.knex);
    this.device = Device.bindKnex(this.knex);

    this.connectedServicesDb = new ConnectedServicesDb(
      new MysqlStoreShared(dbConfig.fxa_oauth),
      new ConnectedServicesCache(
        new RedisShared(redisConfig.accessTokens),
        new RedisShared(redisConfig.refreshTokens),
        new RedisShared(redisConfig.sessionTokens)
      )
    );
  }

  public async authorizedClients(uid: string) {
    const factory = new AuthorizedClientsFactory(this.connectedServicesDb);
    return await factory.build(uid);
  }

  public async attachedDevices(uid: string) {
    const [devices, sessionTokens] = await Promise.all([
      this.device.findByUid(uid),
      this.connectedServicesDb.cache.getSessionTokens(uid),
    ]);
    return mergeDevicesAndSessionTokens(devices, sessionTokens, true);
  }

  async onModuleDestroy() {
    // This tear down is important for jest tests. Without this
    // the tests will hang on completion.
    await this.connectedServicesDb.cache.close();
    await this.connectedServicesDb.db.close();
    await this.knex.destroy();
  }

  async dbHealthCheck(): Promise<Record<string, any>> {
    let status = 'ok';
    try {
      await this.account.query().limit(1);
    } catch (err) {
      status = 'error';
    }
    return {
      db: { status },
    };
  }
}
