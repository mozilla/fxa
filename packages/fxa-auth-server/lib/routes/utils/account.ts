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

/**
 * Emit SNS notifications to attached services (Basket, etc.) for
 * account creation / login events.
 *
 * Mirrors the set of notifications `AccountHandler.createAccount` in
 * `routes/account.ts` fires, so that flows that bypass that handler
 * (passwordless OTP, Google/Apple third-party auth) deliver the same
 * events to downstream subscribers.
 *
 * - `isNewAccount && emailVerified`      → fires `verified` (Basket creates the user)
 * - always                               → fires `login`    (session/device tracking)
 * - `isNewAccount` or `profileChanged`   → fires `profileDataChange`
 *
 * `emailVerified` is independent of `isNewAccount` to match the gate in
 * `AccountHandler.createAccount`, which only fires `verified` when the
 * account is email-verified at creation time. Password-based signups
 * create unverified accounts and fire `verified` later from
 * `signupUtils.verifyAccount`; passwordless and third-party auth create
 * already-verified accounts and should fire it immediately.
 */
export async function notifyAttachedServicesForAccountSession(options: {
  log: AuthLogger;
  request: AuthRequest;
  account: { uid: string; email: string; locale?: string };
  service: string | undefined;
  deviceCount: number;
  isNewAccount: boolean;
  emailVerified: boolean;
  profileChanged: boolean;
}): Promise<void> {
  const {
    log,
    request,
    account,
    service,
    deviceCount,
    isNewAccount,
    emailVerified,
    profileChanged,
  } = options;

  const geoData = request.app.geo;
  const country = geoData.location && geoData.location.country;
  const countryCode = geoData.location && geoData.location.countryCode;
  const userAgent = request.headers['user-agent'];

  const notifications: Promise<void>[] = [];

  if (isNewAccount && emailVerified) {
    notifications.push(
      log.notifyAttachedServices('verified', request, {
        country,
        countryCode,
        email: account.email,
        locale: account.locale,
        service,
        uid: account.uid,
        userAgent,
      })
    );
  }

  notifications.push(
    log.notifyAttachedServices('login', request, {
      country,
      countryCode,
      deviceCount,
      email: account.email,
      service,
      uid: account.uid,
      userAgent,
    })
  );

  if (isNewAccount || profileChanged) {
    notifications.push(
      log.notifyAttachedServices('profileDataChange', request, {
        uid: account.uid,
      })
    );
  }

  await Promise.all(notifications);
}

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
    emailLogoUrl: rpCmsConfig?.shared?.emailLogoUrl,
    emailLogoAltText: rpCmsConfig?.shared?.emailLogoAltText,
    emailLogoWidth: rpCmsConfig?.shared?.emailLogoWidth,
    ...rpCmsConfig[emailTemplate],
  };
}
