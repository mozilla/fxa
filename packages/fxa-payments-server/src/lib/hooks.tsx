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
import { ButtonBaseProps } from '../components/PayPalButton';
import { CouponDetails } from 'fxa-shared/dto/auth/payments/coupon';
import { checkCouponRepeating, incDateByMonth } from './coupon';
import { Plan, WebSubscription } from 'fxa-shared/subscriptions/types';
import { apiInvoicePreview } from './apiClient';

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

export function useHandleConfirmationDialog(
  customerSubscription: WebSubscription,
  plan: Plan
) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    const getSubscriptionPrice = async () => {
      const {
        promotion_code: promotionCode,
        plan_id: priceId,
        promotion_end,
        current_period_end,
        promotion_duration,
      } = customerSubscription;

      if (
        promotionCode &&
        promotion_duration &&
        ((promotion_duration === 'repeating' &&
          promotion_end &&
          promotion_end > current_period_end) ||
          promotion_duration === 'forever')
      ) {
        try {
          setLoading(true);
          const preview = await apiInvoicePreview({ priceId, promotionCode });
          setAmount(preview.total);
        } catch (err) {
          setError(true);
        } finally {
          setLoading(false);
        }
      } else {
        if (plan.amount) {
          setAmount(plan.amount);
        } else {
          setError(true);
        }
        setLoading(false);
      }
    };

    getSubscriptionPrice();
  }, [customerSubscription, plan]);

  return { loading, error, amount };
}
