/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { signIn } from 'apps/payments/next/auth';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import {
  determineCurrencyAction,
  getMetricsFlowAction,
} from '@fxa/payments/ui/actions';
import { BaseParams, buildRedirectUrl } from '@fxa/payments/ui';
import { config } from 'apps/payments/next/config';
import { getApp, getIpAddress } from '@fxa/payments/ui/server';
import {
  buildSp2RedirectUrl,
  getSP2Params,
  determineRedirectToSp2,
} from '@fxa/payments/legacy';
import crypto from 'crypto';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic'; // defaults to auto

/**
 * This landing route will initiate the OAuth no prompt signin
 * attempt with FxA.
 *
 * Only when an unexpected error occurs, will the user be redirected
 * to a generic error page.
 *
 * On successful authentication, the customer will be redirected
 * to the /new page in a "Signed In" state. (i.e. FxA uid added to cart)
 *
 * On failure the customer will be redirected to /error/auth/signin
 * where the error will be handled correctly, and ideally redirect
 * the customer to the /new page in a "Signed Out" state. (i.e. no
 * FxA uid added to the cart)
 *
 * This needs to be a route handler, since the `signIn` server
 * action needs to be executed from a route handler.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<BaseParams> }
) {
  const resolvedParams = await params;
  const requestSearchParams = request.nextUrl.searchParams;
  const logger = getApp().getLogger();
  const emitterService = getApp().getEmitterService();
  const ipAddress = await getIpAddress();

  const reportError = (message: string, details?: any) => {
    if (details) {
      logger.error(message, details);
      Sentry.captureMessage(message, details);
    } else {
      logger.error(message);
      Sentry.captureMessage(message, 'error');
    }
  };

  if (config.sp2redirect.enabled) {
    const queryCurrency = requestSearchParams.get('currency');
    const querySpVersion = requestSearchParams.get('spVersion');
    const shouldRedirectToSp2 = determineRedirectToSp2(
      config.sp2redirect,
      resolvedParams.offeringId,
      crypto.randomInt(1, 100),
      reportError,
      querySpVersion
    );

    if (shouldRedirectToSp2) {
      let sp2RedirectUrl: string | undefined;
      try {
        const currency = queryCurrency
          ? queryCurrency
          : await determineCurrencyAction(ipAddress);
        const { productId, priceId } = getSP2Params(
          config.sp2map,
          reportError,
          resolvedParams.offeringId,
          resolvedParams.interval,
          currency
        );

        sp2RedirectUrl = buildSp2RedirectUrl(
          productId,
          priceId,
          config.contentServerUrl,
          requestSearchParams
        );

        emitterService.emit('sp3Rollout', {
          version: '2',
          offeringId: resolvedParams.offeringId,
          interval: resolvedParams.interval,
          shadowMode: config.sp2redirect.shadowMode,
        });

        if (config.sp2redirect.shadowMode) {
          logger.info('SP2 Redirect Shadow Mode enabled', { sp2RedirectUrl });
        }
      } catch (error) {
        logger.error('SP2 redirect error', { error });
      } finally {
        if (!config.sp2redirect.shadowMode) {
          if (!sp2RedirectUrl) {
            const pageNotFoundUrl = new URL(
              buildRedirectUrl(
                resolvedParams.offeringId,
                resolvedParams.interval,
                'page-not-found',
                'checkout',
                {
                  locale: resolvedParams.locale,
                  baseUrl: config.paymentsNextHostedUrl,
                }
              )
            );
            sp2RedirectUrl = pageNotFoundUrl.href;
          }
          redirect(sp2RedirectUrl);
        }
      }
    } else {
      emitterService.emit('sp3Rollout', {
        version: '3',
        offeringId: resolvedParams.offeringId,
        interval: resolvedParams.interval,
        shadowMode: config.sp2redirect.shadowMode,
      });
    }
  }

  const searchParams = Object.fromEntries(requestSearchParams);

  if (searchParams?.spVersion) {
    delete searchParams.spVersion;
  }

  const redirectToUrl = new URL(
    buildRedirectUrl(resolvedParams.offeringId, resolvedParams.interval, 'new', 'checkout', {
      locale: resolvedParams.locale,
      baseUrl: config.paymentsNextHostedUrl,
      searchParams,
    })
  );

  let redirectUrl;
  try {
    try {
      const metricsFlow = await getMetricsFlowAction();
      redirectToUrl.searchParams.set('flow_id', metricsFlow.flowId);
      redirectToUrl.searchParams.set(
        'flow_begin_time',
        metricsFlow.flowBeginTime.toString()
      );
    } catch (error) {
      logger.error('Failed to fetch metrics flow', { error });
    }
    redirectUrl = await signIn(
      'fxa',
      {
        redirect: false,
        redirectTo: redirectToUrl.href,
      },
      { prompt: 'none' }
    );
  } catch (error) {
    // Log the error and redirect to /new without attempting signIn
    logger.error('Failed to sign in', { error });
  }

  if (!redirectUrl) {
    redirectUrl = redirectToUrl.href;
  }

  redirect(redirectUrl);
}
