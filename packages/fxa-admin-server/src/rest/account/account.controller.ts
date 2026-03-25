/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';

import { NotifierService } from '@fxa/shared/notifier';
import { Firestore } from '@google-cloud/firestore';
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { SentryTraced } from '@sentry/nestjs';
import {
  ClientFormatter,
  ConnectedServicesFactory,
  SessionToken,
} from 'fxa-shared/connected-services';
import { AttachedSession } from 'fxa-shared/connected-services/models/AttachedSession';
import {
  Account,
  Email,
  getAccountCustomerByUid,
} from 'fxa-shared/db/models/auth';
import { SecurityEventNames } from 'fxa-shared/db/models/auth/security-event';
import { AdminPanelFeature } from '@fxa/shared/guards';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { ReasonForDeletion } from '@fxa/shared/cloud-tasks';
import { CurrentUser } from '../../auth/auth-header.decorator';
import { AuthHeaderGuard } from '../../auth/auth-header.guard';
import { Features } from '../../auth/user-group-header.decorator';
import { AuditLog } from '../../auth/audit-log.decorator';
import { EmailService } from '../../backend/email.service';
import {
  CloudTasks,
  CloudTasksService,
} from '../../backend/cloud-tasks.service';
import { FirestoreService } from '../../backend/firestore.service';
import { ProfileClient } from '@fxa/profile/client';
import { AppConfig } from '../../config';
import { DatabaseService } from '../../database/database.service';
import { uuidTransformer } from '../../database/transformers';
import {
  EventLoggingService,
  EventNames,
} from '../../event-logging/event-logging.service';
import { AccountEvent as AccountEventType } from '../model/account-events.model';
import { BasketService } from '../../newsletters/basket.service';
import { FidoMdsService } from '../../backend/fido-mds.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import {
  AccountDeleteResponse,
  AccountDeleteStatus,
  AccountDeleteTaskStatus,
  AccountResetResponse,
  AccountResetStatus,
} from '../../types';
import { CartManager } from '@fxa/payments/cart';
import { randomBytes } from 'node:crypto';

const ACCOUNT_COLUMNS = [
  'uid',
  'email',
  'emailVerified',
  'createdAt',
  'disabledAt',
  'lockedAt',
  'verifierSetAt',
  'locale',
  'clientSalt',
];
const EMAIL_COLUMNS = [
  'createdAt',
  'email',
  'id',
  'isPrimary',
  'isVerified',
  'normalizedEmail',
  'uid',
];

const SECURITY_EVENTS_COLUMNS = [
  'uid',
  'verified',
  'createdAt',
  'ipAddr',
  'additionalInfo',
];
const EMAIL_BOUNCE_COLUMNS = [
  'email',
  'bounceType',
  'bounceSubType',
  'createdAt',
  'diagnosticCode',
];
const TOTP_COLUMNS = ['uid', 'epoch', 'createdAt', 'verified', 'enabled'];
const RECOVERYKEY_COLUMNS = [
  'uid',
  'createdAt',
  'verifiedAt',
  'enabled',
  'hint',
];
const RECOVERYPHONES_COLUMNS = ['phoneNumber'];
const LINKEDACCOUNT_COLUMNS = ['uid', 'authAt', 'providerId', 'enabled'];

// credentialId, publicKey, signCount, and backupEligible are intentionally
// excluded from the admin view because they expose sensitive cryptographic
// material.
const PASSKEY_COLUMNS = [
  'name',
  'createdAt',
  'lastUsedAt',
  'aaguid',
  'backupState',
  'prfEnabled',
];

/**
 * Converts a 16-byte Buffer to a lowercase UUID string
 * in the standard 8-4-4-4-12 hyphenated format.
 */
function bufferToUuidString(buf: Buffer): string {
  const hex = buf.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

@UseGuards(AuthHeaderGuard)
@Controller('/api/account')
export class AccountController {
  private get clientFormatterConfig() {
    return this.configService.get(
      'clientFormatter'
    ) as AppConfig['clientFormatter'];
  }

  private get ipHmacKey() {
    return this.configService.get('ipHmacKey') as AppConfig['ipHmacKey'];
  }

  constructor(
    private log: MozLoggerService,
    private db: DatabaseService,
    private cartManager: CartManager,
    private subscriptionsService: SubscriptionsService,
    private configService: ConfigService<AppConfig>,
    private eventLogging: EventLoggingService,
    private basketService: BasketService,
    private notifier: NotifierService,
    @Inject(EmailService) private emailService: EmailService,
    @Inject(FirestoreService) private firestore: Firestore,
    @Inject(CloudTasksService) private cloudTask: CloudTasks,
    @Inject(ProfileClient) private profileClient: ProfileClient,
    private mds: FidoMdsService
  ) {}

  /**
   * Resolves all nested account data fields and returns a full account object.
   */
  private async resolveAccountData(account: Account) {
    const [
      emails,
      emailBounces,
      securityEvents,
      accountEvents,
      totp,
      recoveryKeys,
      subscriptions,
      carts,
      backupCodes,
      recoveryPhone,
      linkedAccounts,
      attachedClients,
      passkeys,
    ] = await Promise.all([
      this.emails(account),
      this.emailBounces(account),
      this.securityEvents(account),
      this.accountEvents(account),
      this.totp(account),
      this.recoveryKeys(account),
      this.subscriptions(account),
      this.carts(account),
      this.backupCodes(account),
      this.recoveryPhone(account),
      this.linkedAccounts(account),
      this.attachedClients(account),
      this.passkeys(account),
    ]);

    return {
      ...account,
      emails,
      emailBounces,
      securityEvents,
      accountEvents,
      totp,
      recoveryKeys,
      subscriptions,
      carts,
      backupCodes,
      recoveryPhone,
      linkedAccounts,
      attachedClients,
      passkeys,
    };
  }

  @Features(AdminPanelFeature.AccountSearch)
  @Get('by-uid')
  public async accountByUid(
    @Query('uid') uid: string,
    @CurrentUser() user: string
  ) {
    this.eventLogging.onAccountSearch('uid', false);
    let uidBuffer;
    try {
      uidBuffer = uuidTransformer.to(uid);
    } catch (err) {
      return false;
    }
    this.log.info('accountByUid', { uid, user });
    const account = await this.db.account
      .query()
      .select(ACCOUNT_COLUMNS)
      .findOne({ uid: uidBuffer });

    if (!account) {
      return false;
    }
    return this.resolveAccountData(account);
  }

  @Features(AdminPanelFeature.AccountSearch)
  @Get('by-email')
  @SentryTraced('accountByEmail')
  public async accountByEmail(
    @Query('email') email: string,
    @Query('autoCompleted') autoCompleted: string,
    @CurrentUser() user: string
  ) {
    this.eventLogging.onAccountSearch('email', autoCompleted === 'true');
    this.log.info('accountByEmail', { email, user });

    let account = await this.db.account
      .query()
      .select(ACCOUNT_COLUMNS.map((c) => 'accounts.' + c))
      .innerJoin('emails', 'emails.uid', 'accounts.uid')
      .where('emails.normalizedEmail', email.toLocaleLowerCase())
      .first();

    if (!account) {
      account = await this.db.account
        .query()
        .select(ACCOUNT_COLUMNS.map((c) => 'accounts.' + c))
        .where('accounts.normalizedEmail', email.toLocaleLowerCase())
        .first();
    }

    if (!account) {
      return false;
    }
    return this.resolveAccountData(account);
  }

  @Features(AdminPanelFeature.AccountSearch)
  @Get('by-recovery-phone')
  @SentryTraced('accountByRecoveryPhone')
  public async accountByRecoveryPhone(
    @Query('phoneNumber') phoneNumber: string,
    @Query('autoCompleted') autoCompleted: string,
    @CurrentUser() user: string
  ) {
    this.eventLogging.onAccountSearch('phoneNumber', autoCompleted === 'true');
    this.log.info('accountByRecoveryPhone', { phoneNumber, user });

    const accounts = await this.db.account
      .query()
      .select(ACCOUNT_COLUMNS.map((c) => 'accounts.' + c))
      .innerJoin('recoveryPhones', 'recoveryPhones.uid', 'accounts.uid')
      .where('recoveryPhones.phoneNumber', phoneNumber)
      .limit(50);

    return Promise.all(accounts.map((a) => this.resolveAccountData(a)));
  }

  @Features(AdminPanelFeature.AccountSearch)
  @Get('emails-like')
  public getEmailsLike(@Query('search') search: string) {
    return this.db.emails
      .query()
      .select(EMAIL_COLUMNS)
      .where('normalizedEmail', 'like', `${search.toLowerCase()}%`)
      .limit(10);
  }

  @Features(AdminPanelFeature.AccountSearch)
  @Get('recovery-phones-like')
  public getRecoveryPhonesLike(@Query('search') search: string) {
    return this.db.recoveryPhones
      .query()
      .select(RECOVERYPHONES_COLUMNS)
      .where('phoneNumber', 'like', `${search}%`)
      .distinct('phoneNumber')
      .limit(10);
  }

  @Features(AdminPanelFeature.DeleteAccount)
  @Get('delete-status')
  public async getDeleteStatus(
    @Query('taskNames') taskNames: string | string[]
  ) {
    const names = Array.isArray(taskNames) ? taskNames : [taskNames];
    const results: AccountDeleteTaskStatus[] = [];
    for (const taskName of names) {
      try {
        const [result] =
          await this.cloudTask.accountTasks.getTaskStatus(taskName);
        if (result == null) {
          results.push({ taskName, status: 'Unknown task' });
        } else {
          results.push({
            taskName,
            status: result.lastAttempt?.responseStatus?.message || 'Pending',
          });
        }
      } catch (error) {
        this.log.warn('getDeleteStatus', { errorCode: error.code });
        if (error.code === 9) {
          results.push({ taskName, status: 'Task completed.' });
        } else {
          results.push({
            taskName,
            status: 'Task completed and no longer in queue.',
          });
        }
      }
    }
    return results;
  }

  @Features(AdminPanelFeature.Remove2FA)
  @AuditLog()
  @Post('remove-2fa')
  public async remove2FA(@Body('uid') uid: string) {
    this.eventLogging.onEvent(EventNames.Remove2FA);
    const rowsDeleted = await this.db.totp.transaction(async (trx) => {
      const recoveryPhoneRecordsDeleted = await this.db.recoveryPhones
        .query(trx)
        .delete()
        .where('uid', uuidTransformer.to(uid));
      const recoveryCodeRecordsDeleted = await this.db.recoveryCodes
        .query(trx)
        .delete()
        .where('uid', uuidTransformer.to(uid));
      const totpRecordsDeleted = await this.db.totp
        .query(trx)
        .delete()
        .where('uid', uuidTransformer.to(uid));

      return (
        recoveryCodeRecordsDeleted +
        recoveryPhoneRecordsDeleted +
        totpRecordsDeleted
      );
    });

    const deleted = rowsDeleted > 0;

    if (deleted) {
      await this.notifier.send({
        event: 'profileDataChange',
        data: {
          ts: Date.now() / 1000,
          uid,
        },
      });
    }

    return deleted;
  }

  @Features(AdminPanelFeature.UnverifyEmail)
  @AuditLog()
  @Post('unverify-email')
  public async unverifyEmail(@Body('email') email: string) {
    this.eventLogging.onEvent(EventNames.UnverifyEmail);
    const result = await this.db.emails
      .query()
      .where('normalizedEmail', 'like', `${email.toLowerCase()}%`)
      .update({
        isVerified: false,
        verifiedAt: null as any,
      });
    return !!result;
  }

  @Features(AdminPanelFeature.DisableAccount)
  @AuditLog()
  @Post('disable')
  public async disableAccount(@Body('uid') uid: string) {
    this.eventLogging.onEvent(EventNames.DisableLogin);
    await this.profileClient.deleteCache(uid);
    await this.notifier.send({
      event: 'profileDataChange',
      data: {
        ts: Date.now() / 1000,
        uid,
      },
    });
    const uidBuffer = uuidTransformer.to(uid);
    const result = await this.db.account
      .query()
      .update({ disabledAt: Date.now() })
      .where('uid', uidBuffer);
    return !!result;
  }

  @Features(AdminPanelFeature.EnableAccount)
  @AuditLog()
  @Post('enable')
  public async enableAccount(@Body('uid') uid: string) {
    const uidBuffer = uuidTransformer.to(uid);
    const result = await this.db.account
      .query()
      .update({ disabledAt: null } as any)
      .where('uid', uidBuffer);

    await this.profileClient.deleteCache(uid);
    await this.notifier.send({
      event: 'profileDataChange',
      data: {
        ts: Date.now() / 1000,
        uid,
      },
    });

    return !!result;
  }

  @Features(AdminPanelFeature.EditLocale)
  @AuditLog()
  @Post('edit-locale')
  public async editLocale(
    @Body('uid') uid: string,
    @Body('locale') locale: string
  ) {
    this.eventLogging.onEvent(EventNames.EditLocale);
    const uidBuffer = uuidTransformer.to(uid);
    const result = await this.db.account
      .query()
      .update({ locale: locale })
      .where('uid', uidBuffer);

    await this.profileClient.deleteCache(uid);
    await this.notifier.send({
      event: 'profileDataChange',
      data: {
        ts: Date.now() / 1000,
        uid,
      },
    });

    return !!result;
  }

  @Features(AdminPanelFeature.DeleteRecoveryPhone)
  @AuditLog()
  @Post('delete-recovery-phone')
  public async deleteRecoveryPhone(@Body('uid') uid: string): Promise<Boolean> {
    this.eventLogging.onEvent(EventNames.DeleteRecoveryPhone);

    const uidBuffer = uuidTransformer.to(uid);

    const existing = await this.db.recoveryPhones
      .query()
      .where('uid', uidBuffer)
      .first();
    if (!existing) {
      return false;
    }

    const result = await this.db.recoveryPhones
      .query()
      .delete()
      .where('uid', uidBuffer);

    return !!result;
  }

  @Features(AdminPanelFeature.UnlinkAccount)
  @AuditLog()
  @Post('unlink')
  public async unlinkAccount(
    @Body('uid') uid: string,
    @CurrentUser() user: string
  ) {
    const result = await this.db.linkedAccounts
      .query()
      .delete()
      .where({
        uid: uuidTransformer.to(uid),
        providerId: 1,
      });
    return !!result;
  }

  @Features(AdminPanelFeature.UnsubscribeFromMailingLists)
  @AuditLog()
  @Post('unsubscribe-mailing-lists')
  public async unsubscribeFromMailingLists(@Body('uid') uid: string) {
    const account = await this.db.account
      .query()
      .select('email')
      .where({ uid: uuidTransformer.to(uid) })
      .first();

    if (!account) {
      return false;
    }

    const token = await this.basketService.getUserToken(account.email);
    if (!token) {
      return false;
    }

    const success = await this.basketService.unsubscribeAll(token);

    if (success) {
      this.eventLogging.onEvent(EventNames.UnsubscribeFromMailingLists);
    }

    return success;
  }

  @Features(AdminPanelFeature.AccountSearch)
  @Post('record-security-event')
  public async recordAdminSecurityEvent(
    @Body('uid') uid: string,
    @Body('name') name: SecurityEventNames,
    @Req() req: Request
  ) {
    const result = await this.db.securityEvents.create({
      uid,
      name,
      ipAddr: (req.headers['x-forwarded-for'] as string) || req.ip || '',
      ipHmacKey: this.ipHmacKey,
      additionalInfo: {
        userAgent: req.headers['user-agent'],
        adminPanelAction: true,
      },
    });
    return !!result;
  }

  @Features(AdminPanelFeature.DeleteAccount)
  @AuditLog()
  @Post('delete')
  public async deleteAccounts(
    @Body('locators') locators: string | string[],
    @CurrentUser() user: string
  ) {
    this.eventLogging.onEvent('deleteAccounts');

    const locatorList = Array.isArray(locators) ? locators : [locators];
    if (locatorList.length > 1000) {
      throw new Error('Provide less than 1000 account locators.');
    }

    const createTask = async (
      locator: string
    ): Promise<AccountDeleteResponse> => {
      this.log.info('deleteAccounts', { locator, user });

      let account: Account | undefined;
      if (/@/.test(locator)) {
        account = await this.db.account
          .query()
          .select(ACCOUNT_COLUMNS.map((c) => 'accounts.' + c))
          .innerJoin('emails', 'emails.uid', 'accounts.uid')
          .where('emails.normalizedEmail', locator.toLocaleLowerCase())
          .first();
      } else if (/.*/.test(locator)) {
        let uidBuffer;
        try {
          uidBuffer = uuidTransformer.to(locator);
        } catch (err) {
          return {
            taskName: '',
            locator,
            status: AccountDeleteStatus.NoAccount,
          };
        }
        account = await this.db.account
          .query()
          .select(ACCOUNT_COLUMNS)
          .findOne({ uid: uidBuffer });
      }

      if (!account) {
        return {
          taskName: '',
          locator,
          status: AccountDeleteStatus.NoAccount,
        };
      }
      const { stripeCustomerId } =
        (await getAccountCustomerByUid(account.uid)) || {};

      const taskName = await this.cloudTask.accountTasks.deleteAccount({
        uid: account.uid,
        customerId: stripeCustomerId,
        reason: ReasonForDeletion.AdminRequested,
      });

      if (taskName) {
        return {
          taskName,
          locator,
          status: AccountDeleteStatus.Success,
        };
      }

      return {
        taskName: '',
        locator,
        status: AccountDeleteStatus.Failure,
      };
    };

    const promises = [];
    for (const locator of locatorList) {
      promises.push(createTask(locator));
    }

    return Promise.all(promises);
  }

  @Features(AdminPanelFeature.AccountReset)
  @AuditLog()
  @Post('reset')
  public async resetAccounts(
    @Body('locators') locators: string | string[],
    @Body('notificationEmail') notificationEmail: string,
    @CurrentUser() user: string,
    @Req() req: Request
  ) {
    this.eventLogging.onEvent('deleteAccounts');

    const locatorList = Array.isArray(locators) ? locators : [locators];
    if (locatorList.length > 1000) {
      throw new Error('Provide less than 1000 account locators.');
    }

    const status: AccountResetResponse[] = [];
    for (const locator of locatorList) {
      this.log.info('resetAccounts', { locator, user });

      let account: Account | undefined;
      if (/@/.test(locator)) {
        account = await this.db.account
          .query()
          .select(ACCOUNT_COLUMNS.map((c) => 'accounts.' + c))
          .innerJoin('emails', 'emails.uid', 'accounts.uid')
          .where('emails.normalizedEmail', locator.toLocaleLowerCase())
          .first();
      } else if (/.*/.test(locator)) {
        const uidBuffer = (() => {
          try {
            return uuidTransformer.to(locator);
          } catch (err) {
            Sentry.captureException(err, { extra: { locator } });
          }
          return null;
        })();

        if (uidBuffer) {
          account = await this.db.account
            .query()
            .select(ACCOUNT_COLUMNS)
            .findOne({ uid: uidBuffer });
        }
      }

      if (!account) {
        status.push({ locator, status: AccountResetStatus.NoAccount });
      } else {
        try {
          const ONES = Buffer.from(
            'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            'hex'
          );

          await Account.reset({
            uid: account.uid,
            verifyHash: ONES.toString('hex'),
            verifyHashVersion2: ONES.toString('hex'),
            wrapWrapKb: randomBytes(32).toString('hex'),
            wrapWrapKbVersion2: randomBytes(32).toString('hex'),
            authSalt: ONES.toString('hex'),
            clientSalt: undefined,
            verifierSetAt: Date.now(),
            verifierVersion: 1,
          });

          account.emails = await Email.findByUid(account.uid);
          await this.emailService.sendPasswordChangeRequired(account);

          await this.recordAdminSecurityEvent(
            account.uid,
            'account.must_reset' as SecurityEventNames,
            req
          );

          status.push({ locator, status: AccountResetStatus.Success });
        } catch (err) {
          Sentry.captureException(err);
          status.push({ locator, status: AccountResetStatus.Failure });
        }
      }
    }

    if (notificationEmail) {
      try {
        await this.emailService.sendPasswordResetNotification(
          notificationEmail,
          status
        );
      } catch (err) {
        Sentry.captureException(err);
      }
    }

    return status;
  }

  // ─── Field resolver helpers (public so integration tests can call them) ───

  public async emailBounces(account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    const emails = await this.db.emails
      .query()
      .select('emails.normalizedEmail')
      .where('emails.uid', uidBuffer);
    const result = await this.db.emailBounces
      .query()
      .select(...EMAIL_BOUNCE_COLUMNS, 'emailTypes.emailType as templateName')
      .join('emailTypes', 'emailTypes.id', 'emailBounces.emailTypeId')
      .where(
        'emailBounces.email',
        'in',
        emails.map((x) => x.normalizedEmail)
      );
    return result;
  }

  @Features(AdminPanelFeature.AccountSearch)
  public async emails(account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.emails
      .query()
      .select(EMAIL_COLUMNS)
      .where('uid', uidBuffer);
  }

  @Features(AdminPanelFeature.AccountSearch)
  public async securityEvents(account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.securityEvents
      .query()
      .select(...SECURITY_EVENTS_COLUMNS, 'securityEventNames.name as name')
      .join(
        'securityEventNames',
        'securityEvents.nameId',
        'securityEventNames.id'
      )
      .where('uid', uidBuffer)
      .limit(10)
      .orderBy('createdAt', 'DESC');
  }

  @Features(AdminPanelFeature.AccountSearch)
  public async accountEvents(account: Account) {
    const eventsDbRef = this.firestore.collection('fxa-eb-users');
    const queryResult = await eventsDbRef
      .doc(account.uid)
      .collection('events')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    return queryResult.docs.map((doc) => doc.data() as AccountEventType);
  }

  @Features(AdminPanelFeature.AccountSearch)
  public async totp(account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.totp
      .query()
      .select(TOTP_COLUMNS)
      .where('uid', uidBuffer);
  }

  @Features(AdminPanelFeature.AccountSearch)
  public async recoveryKeys(account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.recoveryKeys
      .query()
      .select(RECOVERYKEY_COLUMNS)
      .where('uid', uidBuffer);
  }

  @Features(AdminPanelFeature.AccountSearch)
  public async subscriptions(account: Account) {
    return await this.subscriptionsService.getSubscriptions(account.uid);
  }

  @Features(AdminPanelFeature.AccountSearch)
  public async carts(account: Account) {
    return await this.cartManager.fetchCartsByUid(account.uid);
  }

  @Features(AdminPanelFeature.AccountSearch)
  public async backupCodes(account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    const result = await this.db.recoveryCodes
      .query()
      .where('uid', uidBuffer)
      .resultSize();

    return [
      {
        hasBackupCodes: result > 0,
        count: result,
      },
    ];
  }

  @Features(AdminPanelFeature.AccountSearch)
  public async recoveryPhone(account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    const result = await this.db.recoveryPhones
      .query()
      .select(RECOVERYPHONES_COLUMNS)
      .where('uid', uidBuffer);

    return [
      {
        exists: result.length > 0,
        lastFourDigits:
          result[0] && result[0].phoneNumber
            ? result[0].phoneNumber.slice(-4)
            : undefined,
      },
    ];
  }

  public async linkedAccounts(account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    return await this.db.linkedAccounts
      .query()
      .select(LINKEDACCOUNT_COLUMNS)
      .where('uid', uidBuffer);
  }

  @Features(AdminPanelFeature.AccountSearch)
  public async passkeys(account: Account) {
    const uidBuffer = uuidTransformer.to(account.uid);
    const rows = await this.db
      .knex('passkeys')
      .select(PASSKEY_COLUMNS)
      .where('uid', uidBuffer)
      .orderBy('createdAt', 'desc');
    return Promise.all(
      rows.map(
        async (row: {
          name: string;
          createdAt: number;
          lastUsedAt: number | null;
          aaguid: Buffer;
          backupState: boolean;
          prfEnabled: boolean;
        }) => {
          const aaguid = bufferToUuidString(row.aaguid);
          const isZeroOrInvalidAaguid =
            row.aaguid.every((b) => b === 0) || row.aaguid.length !== 16;
          const authenticatorName = isZeroOrInvalidAaguid
            ? undefined
            : await this.mds.getAuthenticatorName(
                bufferToUuidString(row.aaguid)
              );
          return { ...row, aaguid, authenticatorName };
        }
      )
    );
  }

  @Features(AdminPanelFeature.ConnectedServices)
  public async attachedClients(account: Account) {
    const clientFormatter = new ClientFormatter(
      this.clientFormatterConfig,
      () => this.log
    );

    const factory = new ConnectedServicesFactory({
      formatLocation: (...args) => {
        clientFormatter.formatLocation(...args);
      },
      formatTimestamps: (...args) => {
        clientFormatter.formatTimestamps(...args);
      },
      deviceList: async () => {
        return this.db.attachedDevices(account.uid);
      },
      oauthClients: async () => {
        return await this.db.authorizedClients(account.uid);
      },
      sessions: async () => {
        return (await this.db.attachedSessions(account.uid)).map(
          (x: SessionToken) => {
            const token = x;
            if (!x.id) {
              x.id = 'Unknown';
            }
            return token as AttachedSession;
          }
        );
      },
    });

    return (await factory.build('', 'en'))
      .sort((a, b) => (b.lastAccessTime || 0) - (a.lastAccessTime || 0))
      .map((x) => {
        if (x.sessionTokenId) x.sessionTokenId = '[REDACTED]';
        if (x.refreshTokenId) x.refreshTokenId = '[REDACTED]';
        return x;
      });
  }
}
