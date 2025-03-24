/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { signIn } from 'apps/payments/next/auth';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import {
  determineCurrencyAction,
  getMetricsFlowAction,
  getTaxAddressAction,
} from '@fxa/payments/ui/actions';
import { BaseParams, buildRedirectUrl } from '@fxa/payments/ui';
import { config } from 'apps/payments/next/config';
import { getApp, getIpAddress } from '@fxa/payments/ui/server';
import {
  buildSp2RedirectUrl,
  getSP2Params,
  redirectToSp2,
} from '@fxa/payments/legacy';
import crypto from 'crypto';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic'; // defaults to auto

function reportError(message: string, details?: any) {
  if (details) {
    console.error(message, details);
    Sentry.captureMessage(message, details);
  } else {
    console.error(message);
    Sentry.captureMessage(message, 'error');
  }
}

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
  { params }: { params: BaseParams }
) {
  const requestSearchParams = request.nextUrl.searchParams;
  const emitterService = getApp().getEmitterService();
  const ipAddress = getIpAddress();

  if (config.sp2redirect.enabled) {
    const queryCurrency = requestSearchParams.get('currency');
    const querySpVersion = requestSearchParams.get('spVersion');
    const isSp2Redirect = redirectToSp2(
      config.sp2redirect,
      params.offeringId,
      crypto.randomInt(1, 100),
      reportError
    );

    if (isSp2Redirect || querySpVersion === '2') {
      const currency = queryCurrency
        ? queryCurrency
        : await determineCurrencyAction(ipAddress);
      const { productId, priceId } = getSP2Params(
        config.sp2map,
        reportError,
        params.offeringId,
        params.interval,
        currency
      );

      const sp2RedirectUrl = buildSp2RedirectUrl(
        productId,
        priceId,
        config.contentServerUrl,
        requestSearchParams
      );

      emitterService.emit('sp3Rollout', {
        version: '2',
        offeringId: params.offeringId,
        interval: params.interval,
        shadowMode: config.sp2redirect.shadowMode,
      });

      if (!config.sp2redirect.shadowMode) {
        redirect(sp2RedirectUrl);
      } else {
        console.log('SP2 Redirect Shadow Mode enabled', { sp2RedirectUrl });
      }
    } else {
      emitterService.emit('sp3Rollout', {
        version: '3',
        offeringId: params.offeringId,
        interval: params.interval,
        shadowMode: config.sp2redirect.shadowMode,
      });
    }
  }

  const searchParams = Object.fromEntries(requestSearchParams);

  const { taxAddress } = await getTaxAddressAction(ipAddress);
  if (taxAddress) {
    searchParams.countryCode = taxAddress.countryCode;
    searchParams.postalCode = taxAddress.postalCode;
  }

  const page = taxAddress ? 'new' : 'location';

  const redirectToUrl = new URL(
    buildRedirectUrl(params.offeringId, params.interval, page, 'checkout', {
      locale: params.locale,
      baseUrl: config.paymentsNextHostedUrl,
      searchParams,
    })
  );

  let redirectUrl;
  try {
    try {
      const metricsFlow = await getMetricsFlowAction();
      redirectToUrl.searchParams.set('flowId', metricsFlow.flowId);
      redirectToUrl.searchParams.set(
        'flowBeginTime',
        metricsFlow.flowBeginTime.toString()
      );
    } catch (error) {
      console.error(error);
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
    console.error(error);
  }

  if (!redirectUrl) {
    redirectUrl = redirectToUrl.href;
  }

  redirect(redirectUrl);
}
