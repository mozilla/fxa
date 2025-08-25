import { StripeHelper } from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import error from '../../error';
import { reportSentryError } from '../../../lib/sentry';
import { RelyingPartiesQuery } from '../../../../../libs/shared/cms/src/__generated__/graphql';
import { RelyingPartyConfigurationManager } from '@fxa/shared/cms';

export const deleteAccountIfUnverified = async (
  db: any,
  stripeHelper: StripeHelper,
  log: AuthLogger,
  request: AuthRequest,
  email: string
) => {
  try {
    const secondaryEmailRecord = await db.getSecondaryEmail(email);
    // Currently, users cannot create an account from a verified
    // secondary email address
    if (secondaryEmailRecord.isPrimary) {
      if (
        secondaryEmailRecord.isVerified ||
        (await stripeHelper.hasActiveSubscription(secondaryEmailRecord.uid))
      ) {
        throw error.accountExists(secondaryEmailRecord.email);
      }
      request.app.accountRecreated = true;

      // If an unverified (stub) account has a Stripe customer without any
      // subscriptions, delete the customer.
      try {
        await stripeHelper.removeCustomer(secondaryEmailRecord.uid);
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

export const fetchRpCmsData = async (
  request: AuthRequest,
  cmsManager: RelyingPartyConfigurationManager | null,
  logger: AuthLogger
): Promise<RelyingPartiesQuery['relyingParties'][0] | null> => {
  const metricsContext = await request.app.metricsContext;
  if (metricsContext.clientId && metricsContext.entrypoint && cmsManager) {
    try {
      const res = await cmsManager.fetchCMSData(
        metricsContext.clientId,
        metricsContext.entrypoint
      );
      return res.relyingParties.length > 0 ? res.relyingParties[0] : null;
    } catch (error) {
      logger.error('cms.getConfig.error', { error });
    }
  }

  return null;
};

export async function getOptionalCmsEmailConfig(
  emailOptions,
  { request, cmsManager, log, emailTemplate }
) {
  const metricsContext = await request.app.metricsContext;
  const rpCmsConfig = await fetchRpCmsData(request, cmsManager, log);

  if (!rpCmsConfig || !rpCmsConfig[emailTemplate]) {
    return emailOptions;
  }

  return {
    ...emailOptions,
    target: 'strapi',
    cmsRpClientId: rpCmsConfig.clientId,
    cmsRpFromName: rpCmsConfig.shared?.emailFromName,
    entrypoint: metricsContext.entrypoint,
    logoUrl: rpCmsConfig?.shared?.emailLogoUrl,
    logoAltText: rpCmsConfig?.shared?.emailLogoAltText,
    logoWidth: rpCmsConfig?.shared?.emailLogoWidth,
    ...rpCmsConfig[emailTemplate],
  };
}
