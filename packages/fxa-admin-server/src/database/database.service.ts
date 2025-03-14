/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthorizedClientsFactory,
  ConnectedServicesCache,
  ConnectedServicesDb,
  mergeCachedSessionTokens,
  mergeDevicesAndSessionTokens,
} from 'fxa-shared/connected-services';
import { monitorKnexConnectionPool } from 'fxa-shared/db';
import {
  Account,
  BaseAuthModel,
  Device,
  Email,
  EmailBounce,
  LinkedAccount,
  RecoveryCodes,
  RecoveryKey,
  RecoveryPhones,
  RelyingParty,
  SecurityEvent,
  SessionToken,
  TotpToken,
} from 'fxa-shared/db/models/auth';
import { MysqlOAuthShared } from 'fxa-shared/db/mysql';
import { RedisShared } from 'fxa-shared/db/redis';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { StatsD } from 'hot-shots';
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
  public knexOauth: Knex;
  public account: typeof Account;
  public emails: typeof Email;
  public emailBounces: typeof EmailBounce;
  public securityEvents: typeof SecurityEvent;
  public totp: typeof TotpToken;
  public recoveryCodes: typeof RecoveryCodes;
  public recoveryPhones: typeof RecoveryPhones;
  public recoveryKeys: typeof RecoveryKey;
  public sessionTokens: typeof SessionToken;
  public device: typeof Device;
  public relyingParty: typeof RelyingParty;
  public linkedAccounts: typeof LinkedAccount;

  protected mySqlOAuthShared: MysqlOAuthShared;
  protected connectedServicesDb: ConnectedServicesDb;

  constructor(
    configService: ConfigService<AppConfig>,
    logger: MozLoggerService,
    @Inject('METRICS') metrics: StatsD
  ) {
    const dbConfig = configService.get('database') as AppConfig['database'];
    const redisConfig = configService.get('redis') as AppConfig['redis'];
    const mySqlOAuthShared = new MysqlOAuthShared(
      dbConfig.fxa_oauth,
      undefined,
      logger,
      metrics
    );

    this.knex = knex({
      connection: { typeCast: typeCasting, ...dbConfig.fxa },
      client: 'mysql',
    });

    this.knexOauth = knex({
      connection: { typeCast: typeCasting, ...dbConfig.fxa_oauth },
      client: 'mysql',
    });

    monitorKnexConnectionPool(this.knex.client.pool, metrics);

    // Binds knex once, which effectively binds for all inherited types
    BaseAuthModel.knex(this.knex);

    this.account = Account;
    this.emails = Email;
    this.emailBounces = EmailBounce;
    this.securityEvents = SecurityEvent;
    this.totp = TotpToken;
    this.recoveryCodes = RecoveryCodes;
    this.recoveryPhones = RecoveryPhones;
    this.recoveryKeys = RecoveryKey;
    this.sessionTokens = SessionToken;
    this.device = Device;
    this.linkedAccounts = LinkedAccount;

    // Rebind for oauth db
    RelyingParty.knex(this.knexOauth);
    this.relyingParty = RelyingParty;

    this.mySqlOAuthShared = mySqlOAuthShared;
    this.connectedServicesDb = new ConnectedServicesDb(
      mySqlOAuthShared,
      new ConnectedServicesCache(
        new RedisShared(redisConfig.accessTokens, logger, metrics),
        new RedisShared(redisConfig.refreshTokens, logger, metrics),
        new RedisShared(
          { ...redisConfig, ...redisConfig.sessionTokens },
          logger,
          metrics
        ),
        logger
      )
    );
  }

  public async authorizedClients(uid: string) {
    const factory = new AuthorizedClientsFactory(this.connectedServicesDb);
    return await factory.build(uid);
  }

  public async attachedSessions(uid: string) {
    const dbSessionTokens = await this.sessionTokens.findByUid(uid);
    const cachedSessionTokens =
      await this.connectedServicesDb.cache.getSessionTokens(uid);
    return mergeCachedSessionTokens(dbSessionTokens, cachedSessionTokens, true);
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
    await this.knexOauth.destroy();
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
