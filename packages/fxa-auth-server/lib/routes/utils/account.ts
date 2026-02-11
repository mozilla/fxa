import { StripeHelper } from '../../payments/stripe';
import { AuthLogger, AuthRequest } from '../../types';
import { AppError as error } from '@fxa/accounts/errors';
import { reportSentryError } from '../../../lib/sentry';
import { RelyingPartiesQuery } from '../../../../../libs/shared/cms/src/__generated__/graphql';
import { RelyingPartyConfigurationManager } from '@fxa/shared/cms';
import { DB } from '../../db';

export async function deleteAccountIfUnverified(
  db: DB,
  stripeHelper: StripeHelper | undefined,
  log: AuthLogger,
  request: AuthRequest,
  email: string
) {
  try {
    const secondaryEmailRecord = await db.getSecondaryEmail(email);
    if (secondaryEmailRecord.isPrimary) {
      const hasActiveSubscription = stripeHelper
        ? await stripeHelper.hasActiveSubscription(secondaryEmailRecord.uid)
        : false;

      if (secondaryEmailRecord.isVerified || hasActiveSubscription) {
        throw error.accountExists(secondaryEmailRecord.email);
      }
      request.app.accountRecreated = true;

      if (stripeHelper) {
        try {
          await stripeHelper.removeCustomer(secondaryEmailRecord.uid);
        } catch (err) {
          reportSentryError(err, request);
        }
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
}

export const fetchRpCmsData = async (
  request: AuthRequest,
  cmsManager: RelyingPartyConfigurationManager | null,
  logger: AuthLogger
): Promise<RelyingPartiesQuery['relyingParties'][0] | null> => {
  const metricsContext = await request.app.metricsContext;

  // If an entrypoint is not provided, it is possible that there is
  // a "default" entrypoint config in cms. We check to see if this exists just in case.
  const entrypoint = metricsContext.entrypoint || 'default';
  if (metricsContext.clientId && cmsManager) {
    try {
      const res = await cmsManager.fetchCMSData(
        metricsContext.clientId,
        entrypoint
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
