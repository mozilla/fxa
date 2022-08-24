import { reportSentryError } from '../../../lib/sentry';
import error from '../../error';
import { CapabilityService } from '../../payments/capability';
import { StripeHelper } from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';

export const deleteAccountIfUnverified = async (
  db: any,
  stripeHelper: StripeHelper,
  log: AuthLogger,
  request: AuthRequest,
  email: string,
  capabilityService: CapabilityService
) => {
  try {
    const secondaryEmailRecord = await db.getSecondaryEmail(email);
    // Currently, users cannot create an account from a verified
    // secondary email address
    if (secondaryEmailRecord.isPrimary) {
      if (
        secondaryEmailRecord.isVerified ||
        (await capabilityService.hasActiveSubscription(
          secondaryEmailRecord.uid
        ))
      ) {
        throw error.accountExists(secondaryEmailRecord.email);
      }
      request.app.accountRecreated = true;

      // If an unverified (stub) account has a Stripe customer without any
      // subscriptions, delete the customer.
      try {
        await stripeHelper.removeCustomer(
          secondaryEmailRecord.uid,
          secondaryEmailRecord.email
        );
      } catch (err) {
        // It's not an error where we'd want to stop the deletion of the
        // account.
        reportSentryError(err, request);
      }

      const deleted = await db.deleteAccount(secondaryEmailRecord);
      log.info('accountDeleted.unverifiedSecondaryEmail', {
        ...secondaryEmailRecord,
      });
      return deleted;
    } else {
      if (secondaryEmailRecord.isVerified) {
        throw error.verifiedSecondaryEmailAlreadyExists();
      }

      return await db.deleteEmail(
        secondaryEmailRecord.uid,
        secondaryEmailRecord.email
      );
    }
  } catch (err) {
    if (err.errno !== error.ERRNO.SECONDARY_EMAIL_UNKNOWN) {
      throw err;
    }
  }
};

module.exports = {
  deleteAccountIfUnverified,
};
