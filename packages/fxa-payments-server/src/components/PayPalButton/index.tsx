// This file must be lazy loaded. Otherwise we have a race condition with
// usePaypalButton hook (script loading) and the button will not render.
import React, { useCallback, useEffect, useState, Suspense } from 'react';
import ReactDOM from 'react-dom';

import { Localized } from '@fluent/react';
import * as apiClient from '../../lib/apiClient';
import { Customer, Plan } from '../../store/types';
import { SubscriptionCreateAuthServerAPIs } from '../../routes/Product/SubscriptionCreate';
import { PaymentUpdateAuthServerAPIs } from '../../routes/Subscriptions/PaymentUpdateForm';

import { needsCustomer } from '../../lib/customer';
import {
  GAEvent,
  GAPaymentType,
  GAPurchaseType,
  ReactGALog,
} from '../../lib/reactga-event';
import { AuthServerErrno } from '../../lib/errors';
import { CheckoutType } from 'fxa-shared/subscriptions/types';

declare var paypal: {
  Buttons: {
    driver: Function;
  };
};

export type PaypalButtonProps = {
  customer: Customer | null;
  checkoutType: CheckoutType;
  disabled: boolean;
  idempotencyKey: string;
  refreshSubmitNonce: () => void;
  postSubscriptionAttemptPaypalCallback: (() => void) | (() => Promise<void>);
  beforeCreateOrder?: () => Promise<void>;
  setSubscriptionError: Function;
  selectedPlan: Plan;
  newPaypalAgreement?: boolean;
  apiClientOverrides?: Partial<
    SubscriptionCreateAuthServerAPIs | PaymentUpdateAuthServerAPIs
  >;
  setTransactionInProgress?: Function;
  ButtonBase?: React.ElementType;
  promotionCode?: string;
  discount?: number;
};

export type ButtonBaseProps = {
  onInit?: (
    data: any,
    actions: {
      enable: () => void;
      disable: () => void;
    }
  ) => void;
  createOrder?: () => void;
  onApprove?: (data: { orderID: string }) => void;
  onError?: () => void;
  onClick?: (...args: any[]) => void;
};

export const GENERAL_PAYPAL_ERROR_ID = 'general_paypal_error';

/* istanbul ignore next */
export const PaypalButtonBase =
  typeof paypal !== 'undefined'
    ? paypal.Buttons.driver('react', {
        React,
        ReactDOM,
      })
    : null;

export const PaypalButton = ({
  customer,
  checkoutType,
  disabled,
  idempotencyKey,
  refreshSubmitNonce,
  postSubscriptionAttemptPaypalCallback,
  beforeCreateOrder,
  setSubscriptionError,
  selectedPlan,
  newPaypalAgreement,
  apiClientOverrides,
  setTransactionInProgress,
  ButtonBase = PaypalButtonBase,
  promotionCode,
  discount,
}: PaypalButtonProps) => {
  const {
    currency: currencyCode,
    plan_id: priceId,
    product_id: productId,
  } = selectedPlan;

  const [initSuccess, setInitSuccess] = useState(false);
  const [hideButton, setHideButton] = useState(false);
  const [paypalButtonActions, setPaypalButtonActions] =
    useState<PaypalButtonActionsType>();

  const createOrder = useCallback(async () => {
    try {
      if (beforeCreateOrder) {
        await beforeCreateOrder();
      }
      const { apiGetPaypalCheckoutToken } = {
        ...apiClient,
        ...apiClientOverrides,
      };
      const { token } = await apiGetPaypalCheckoutToken({ currencyCode });
      ReactGALog.logEvent({
        eventName: GAEvent.AddPaymentInfo,
        paymentType: GAPaymentType.PayPal,
        plan: selectedPlan,
        discount,
      });
      /* istanbul ignore next */
      return token;
    } catch (error) {
      if (!error.code) {
        error.code = GENERAL_PAYPAL_ERROR_ID;
      }
      setSubscriptionError(error);
    }
    return null;
  }, [
    apiClientOverrides,
    currencyCode,
    setSubscriptionError,
    beforeCreateOrder,
    discount,
    selectedPlan,
  ]);

  const onApprove = useCallback(
    async (data: { orderID: string }) => {
      const isNewSubscription = newPaypalAgreement && priceId;
      /* istanbul ignore next */
      try {
        if (setTransactionInProgress) {
          setTransactionInProgress(true);
        }
        const {
          apiCreateCustomer,
          apiCapturePaypalPayment,
          apiUpdateBillingAgreement,
        } = {
          ...apiClient,
          ...apiClientOverrides,
        };
        if (needsCustomer(customer)) {
          await apiCreateCustomer({});
        }
        // This is the same token as obtained in createOrder
        const token = data.orderID;
        if (isNewSubscription) {
          ReactGALog.logEvent({
            eventName: GAEvent.PurchaseSubmit,
            plan: selectedPlan,
            purchaseType: GAPurchaseType.New,
            discount,
          });
          await apiCapturePaypalPayment({
            idempotencyKey,
            // @ts-ignore Doesn't like that the existence check for priceId is stored in isNewSubscription
            priceId,
            productId,
            token,
            promotionCode,
            checkoutType,
          });
          ReactGALog.logEvent({
            eventName: GAEvent.Purchase,
            plan: selectedPlan,
            purchaseType: GAPurchaseType.New,
            discount,
          });
        } else {
          await apiUpdateBillingAgreement({
            token,
          });
        }
        await postSubscriptionAttemptPaypalCallback();
      } catch (error) {
        if (isNewSubscription) {
          if (error.errno === AuthServerErrno.UNSUPPORTED_LOCATION) {
            error.code = 'location_unsupported';
          } else if (!error.code) {
            error.code = GENERAL_PAYPAL_ERROR_ID;
          }
          setSubscriptionError(error);
        } else {
          await postSubscriptionAttemptPaypalCallback();
        }
      }
      refreshSubmitNonce();
      return null;
    },
    [
      apiClientOverrides,
      checkoutType,
      customer,
      priceId,
      productId,
      newPaypalAgreement,
      refreshSubmitNonce,
      postSubscriptionAttemptPaypalCallback,
      setSubscriptionError,
      setTransactionInProgress,
      promotionCode,
      idempotencyKey,
      discount,
      selectedPlan,
    ]
  );

  const onError = useCallback(
    (error) => {
      if (initSuccess) {
        error.code = GENERAL_PAYPAL_ERROR_ID;
        setSubscriptionError(error);
      } else {
        // If PayPal button was not initialized successfully then set
        // the loading error and do not display PayPal as a purchase option
        setHideButton(true);
      }
    },
    [setSubscriptionError, initSuccess]
  );

  type PaypalButtonActionsType = {
    disable: () => void;
    enable: () => void;
  };

  useEffect(() => {
    if (paypalButtonActions) {
      if (disabled) {
        paypalButtonActions.disable();
      } else {
        paypalButtonActions.enable();
      }
    }
  });

  const onInit = useCallback(
    (data, actions) => {
      // set our actions for availability in useEffect
      setPaypalButtonActions(actions);
      if (disabled) {
        actions.disable();
      }

      setInitSuccess(true);
    },
    [disabled]
  );

  // Style docs: https://developer.paypal.com/docs/business/checkout/reference/style-guide/
  const styleOptions = {
    layout: 'horizontal',
    color: 'gold',
    shape: 'pill',
    label: 'paypal',
    height: 48,
    tagline: 'false',
  };

  const disabledStyles =
    ' payment-button-disabled after:bg-white after:opacity-40 after:z-[100]';

  if (hideButton || !ButtonBase) {
    return null;
  }

  return (
    <div data-testid="pay-with-other" className={`${!initSuccess && 'hidden'}`}>
      <Localized id="pay-with-heading-paypal-2">
        <p className="pay-with-heading mt-14">Pay with PayPal</p>
      </Localized>
      <Suspense fallback={<div>Loading...</div>}>
        <div
          className={`paypal-button w-60 m-auto mt-14 mb-16 relative z-0${
            disabled ? disabledStyles : ''
          }`}
          data-testid="paypal-button-container"
        >
          {ButtonBase && (
            <ButtonBase
              style={styleOptions}
              data-testid="paypal-button"
              createOrder={createOrder}
              onInit={onInit}
              onApprove={onApprove}
              onError={onError}
            />
          )}
        </div>
      </Suspense>
    </div>
  );
};

export default PaypalButton;
