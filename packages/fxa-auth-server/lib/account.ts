import Container from 'typedi';

import { DB_TOKEN } from './db';
import error from './error';
import { CapabilityService } from './payments/capability';
import { StripeHelper } from './payments/stripe';
import { reportSentryError } from './sentry';
import { AuthLogger, AuthRequest } from './types';

export class Account {
  private capabilityService: CapabilityService;
  private db: any;
  private log: AuthLogger;
  private stripeHelper: StripeHelper;

  constructor() {
    this.capabilityService = Container.get(CapabilityService);
    this.db = Container.get(DB_TOKEN);
    this.log = Container.get(AuthLogger);
    this.stripeHelper = Container.get(StripeHelper);
  }

  isVerified(account: any) {
    return !!account.verifierSetAt;
  }

  // Parameter can be an `account` or an object literal with a `uid` property
  async hasActiveSubscription({ uid }: { uid: string }) {
    return this.capabilityService.hasActiveSubscription(uid);
  }

  // TODO: change name? maybeDeleteUnverifiedAccount?
  async deleteAccountIfUnverified(request: AuthRequest, email: string) {
    try {
      // The email address could be someone's primary or secondary email
      const emailRecord = await this.db.getSecondaryEmail(email);
      const { uid } = emailRecord;
      const account = await this.db.account(uid);
      // Currently, users cannot create an account from a verified
      // secondary email address
      if (emailRecord.isPrimary) {
        if (
          this.isVerified(account) ||
          (await this.hasActiveSubscription(account))
        ) {
          throw error.accountExists(email);
        }
        request.app.accountRecreated = true;

        // If an unverified (stub) account has a Stripe customer without any
        // subscriptions, delete the customer.
        try {
          await this.stripeHelper.removeCustomer(
            emailRecord.uid,
            emailRecord.email
          );
        } catch (err) {
          // It's not an error where we'd want to stop the deletion of the
          // account.
          reportSentryError(err, request);
        }

        const deleted = await this.db.deleteAccount(emailRecord);
        this.log.info('accountDeleted.unverifiedSecondaryEmail', {
          ...emailRecord,
        });
        return deleted;
      } else {
        if (emailRecord.isVerified) {
          throw error.verifiedSecondaryEmailAlreadyExists();
        }

        return await this.db.deleteEmail(emailRecord.uid, emailRecord.email);
      }
    } catch (err) {
      if (err.errno !== error.ERRNO.SECONDARY_EMAIL_UNKNOWN) {
        throw err;
      }
    }
  }
}
