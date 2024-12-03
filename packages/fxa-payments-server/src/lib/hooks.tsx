/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  ChangeEvent,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactGA from 'react-ga4';
import { ButtonBaseProps } from '../components/PayPalButton';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import {
  checkCouponRepeating,
  couponOnSubsequentInvoice,
  incDateByMonth,
} from './coupon';
import {
  MozillaSubscription,
  MozillaSubscriptionTypes,
  Plan,
  WebSubscription,
} from 'fxa-shared/subscriptions/types';
import { apiInvoicePreview } from './apiClient';
import { FirstInvoicePreview } from 'fxa-shared/dto/auth/payments/invoice';
import { Config } from './config';

export function useCallbackOnce(cb: Function, deps: any[]) {
  const called = useRef(false);
  return useCallback(
    () => {
      if (!called.current) {
        cb();
        called.current = true;
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [called, cb, ...deps]
  );
}

type useCheckboxStateResult = [
  boolean,
  (ev: ChangeEvent<HTMLInputElement>) => void
];
export function useCheckboxState(
  defaultState: boolean = false
): useCheckboxStateResult {
  const [state, setState] = useState(defaultState);
  const onChanged = useCallback(
    (ev) => setState(ev.target.checked),
    [setState]
  );
  return [state, onChanged];
}

export function useNonce(generateNonce = uuidv4): [string, () => void] {
  const [nonce, setNonce] = useState(generateNonce());
  const refreshNonce = () => setNonce(generateNonce());
  return [nonce, refreshNonce];
}

export function useMatchMedia(mediaQuery: string, matchMedia: Function) {
  const [matches, setMatches] = useState(matchMedia(mediaQuery).matches);

  useEffect(() => {
    const updateMatches = (event: { matches: Array<string> }) => {
      setMatches(event.matches);
    };

    const mediaQueryList = matchMedia(mediaQuery);
    setMatches(mediaQueryList.matches);
    mediaQueryList.addListener(updateMatches);

    return () => mediaQueryList.removeListener(updateMatches);
  }, [mediaQuery, matchMedia]);

  return matches;
}

export function usePaypalButtonSetup(
  config: any,
  setPaypalScriptLoaded: Function,
  paypalButtonBase?: React.FC<ButtonBaseProps>
) {
  /* istanbul ignore next */
  useEffect(() => {
    if (paypalButtonBase) {
      setPaypalScriptLoaded(true);
      return;
    }

    // Read nonce from the fxa-paypal-csp-nonce meta tag
    const cspNonceMetaTag = document?.querySelector(
      'meta[name="fxa-paypal-csp-nonce"]'
    );
    const cspNonce = JSON.parse(
      decodeURIComponent(cspNonceMetaTag?.getAttribute('content') || '""')
    );

    const script = document.createElement('script');
    script.src = `${config.paypal.scriptUrl}/sdk/js?client-id=${config.paypal.clientId}&vault=true&commit=false&intent=capture&disable-funding=credit,card`;
    // Pass the csp nonce to paypal
    script.setAttribute('data-csp-nonce', cspNonce);
    /* istanbul ignore next */
    script.onload = () => {
      setPaypalScriptLoaded(true);
    };
    /* istanbul ignore next */
    script.onerror = () => {
      throw new Error('Paypal SDK could not be loaded.');
    };
    document.body.appendChild(script);
  }, [config, setPaypalScriptLoaded, paypalButtonBase]);
}

export function useReactGA4Setup(
  config: Config,
  productId: string,
  optedIn: boolean = true
) {
  const { enabled, measurementId, supportedProductIds, debugMode } =
    config.googleAnalytics;

  useEffect(() => {
    // Check if GA is enabled, customer has opted in, and if current productId should support GA
    const products: string[] = !supportedProductIds
      ? []
      : supportedProductIds.split(',');
    if (!optedIn || !enabled || !products.includes(productId)) {
      return;
    }

    // Read nonce from the fxa-paypal-csp-nonce meta tag
    const cspNonceMetaTag = document?.querySelector(
      'meta[name="fxa-ga-csp-nonce"]'
    );
    const cspNonce = JSON.parse(
      decodeURIComponent(cspNonceMetaTag?.getAttribute('content') || '""')
    );

    try {
      // Deny all consent types to disable cookies
      // https://developers.google.com/tag-platform/devguides/privacy#consent_mode_terminology
      ReactGA.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'denied',
      });

      ReactGA.initialize(measurementId, {
        nonce: cspNonce,
        gtagOptions: {
          debug_mode: debugMode,
        },
      });
    } catch (error) {
      console.error('Error initializing GA script\n', error);
    }
  }, [
    enabled,
    measurementId,
    supportedProductIds,
    debugMode,
    productId,
    optedIn,
  ]);
}

export const enum CouponInfoBoxMessageType {
  Repeating = 'coupon-success-repeating',
  Default = 'coupon-success',
}

export function useInfoBoxMessage(
  coupon: CouponDetails | undefined,
  selectedPlan: Plan
) {
  const [infoBoxMessage, setInfoBoxMessage] = useState<{
    message: string;
    couponDurationDate?: number;
  } | null>(null);

  useEffect(() => {
    if (!coupon) {
      setInfoBoxMessage(null);
      return;
    }

    switch (coupon.type) {
      case 'repeating':
        if (
          coupon.durationInMonths &&
          checkCouponRepeating(
            selectedPlan.interval_count,
            selectedPlan.interval,
            coupon.durationInMonths
          )
        ) {
          const couponDurationDate = incDateByMonth(coupon.durationInMonths);
          setInfoBoxMessage({
            message: CouponInfoBoxMessageType.Repeating,
            couponDurationDate: Math.round(couponDurationDate.getTime() / 1000),
          });
        } else {
          setInfoBoxMessage({
            message: CouponInfoBoxMessageType.Default,
          });
        }
        break;
      case 'once':
        setInfoBoxMessage({
          message: CouponInfoBoxMessageType.Default,
        });
        break;
      case 'forever':
      default:
        setInfoBoxMessage(null);
        break;
    }
  }, [coupon, selectedPlan]);

  return infoBoxMessage;
}

/**
 * Type guard function to check if a MozillaSubscription is a WebSubscription
 */
const isWebSubscription = (sub: MozillaSubscription): sub is WebSubscription =>
  sub._subscription_type === MozillaSubscriptionTypes.WEB;

/**
 * Get the promotion code used on an existing WebSubscription using Price ID
 */
export function getPromotionCodeForPrice(
  priceId?: string,
  customerSubscriptions?: MozillaSubscription[] | null
) {
  const webSubscriptionForPlan =
    customerSubscriptions &&
    customerSubscriptions
      .filter(isWebSubscription)
      .find((sub) => sub.plan_id === priceId);

  const usePromotionCode =
    webSubscriptionForPlan &&
    couponOnSubsequentInvoice(
      webSubscriptionForPlan.current_period_end,
      webSubscriptionForPlan.promotion_end,
      webSubscriptionForPlan.promotion_duration
    );

  return usePromotionCode ? webSubscriptionForPlan.promotion_code : undefined;
}

/**
 * Custom Hook to fetch invoice preview for priceId
 * @param priceId
 * @param customerSubscriptions
 * @returns
 */
export function useFetchInvoicePreview(
  priceId?: string,
  customerSubscriptions?: MozillaSubscription[] | null
) {
  const [invoicePreview, setInvoicePreview] = useState<{
    loading: boolean;
    error: any;
    result?: FirstInvoicePreview;
  }>({ loading: false, error: false, result: undefined });
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    const getSubscriptionPrice = async () => {
      if (!priceId) {
        return setInvoicePreview({
          loading: false,
          error: false,
          result: undefined,
        });
      }

      const promotionCode = getPromotionCodeForPrice(
        priceId,
        customerSubscriptions
      );

      try {
        setInvoicePreview({
          loading: true,
          error: false,
          result: undefined,
        });

        const preview = await apiInvoicePreview({
          priceId,
          promotionCode,
        });

        if (isMounted.current) {
          setInvoicePreview({
            loading: false,
            error: false,
            result: preview,
          });
        }
      } catch (err) {
        if (isMounted.current) {
          setInvoicePreview({
            loading: false,
            error: err,
            result: undefined,
          });
        }
      }
    };

    getSubscriptionPrice();

    return () => {
      isMounted.current = false;
    };
  }, [priceId, customerSubscriptions]);

  return invoicePreview;
}
