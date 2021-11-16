// This file must be lazy loaded. Otherwise we have a race condition with
// usePaypalButton hook (script loading) and the button will not render.
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import * as apiClient from '../../lib/apiClient';
import { Customer } from '../../store/types';
import { SubscriptionCreateAuthServerAPIs } from '../../routes/Product/SubscriptionCreate';
import { PaymentUpdateAuthServerAPIs } from '../../routes/Subscriptions/PaymentUpdateForm';
import classNames from 'classnames';

import './index.scss';

declare var paypal: {
  Buttons: {
    driver: Function;
  };
};

export type PaypalButtonProps = {
  currencyCode: string;
  customer: Customer | null;
  disabled: boolean;
  idempotencyKey: string;
  refreshSubmitNonce: () => void;
  postSubscriptionAttemptPaypalCallback: (() => void) | (() => Promise<void>);
  beforeCreateOrder?: () => Promise<void>;
  setSubscriptionError: Function;
  priceId?: string;
  newPaypalAgreement?: boolean;
  apiClientOverrides?: Partial<
    SubscriptionCreateAuthServerAPIs | PaymentUpdateAuthServerAPIs
  >;
  setTransactionInProgress?: Function;
  ButtonBase?: React.ElementType;
};

export type ButtonBaseProps = {
  createOrder?: () => void;
  onApprove?: (data: { orderID: string }) => void;
  onError?: () => void;
  onClick?: (...args: any[]) => void;
};

export const GENERAL_PAYPAL_ERROR_ID = 'general-paypal-error';

/* istanbul ignore next */
export const PaypalButtonBase =
  typeof paypal !== 'undefined'
    ? paypal.Buttons.driver('react', {
        React,
        ReactDOM,
      })
    : null;

export const PaypalButton = ({
  currencyCode,
  customer,
  disabled,
  idempotencyKey,
  refreshSubmitNonce,
  postSubscriptionAttemptPaypalCallback,
  beforeCreateOrder,
  setSubscriptionError,
  priceId,
  newPaypalAgreement,
  apiClientOverrides,
  setTransactionInProgress,
  ButtonBase = PaypalButtonBase,
}: PaypalButtonProps) => {
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
        if (!customer) {
          await apiCreateCustomer({
            idempotencyKey,
          });
        }
        // This is the same token as obtained in createOrder
        const token = data.orderID;
        if (isNewSubscription) {
          await apiCapturePaypalPayment({
            idempotencyKey,
            // @ts-ignore Doesn't like that the existence check for priceId is stored in isNewSubscription
            priceId,
            token,
          });
        } else {
          await apiUpdateBillingAgreement({
            token,
          });
        }
        await postSubscriptionAttemptPaypalCallback();
      } catch (error) {
        if (isNewSubscription) {
          if (!error.code) {
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
      customer,
      idempotencyKey,
      newPaypalAgreement,
      priceId,
      refreshSubmitNonce,
      postSubscriptionAttemptPaypalCallback,
      setSubscriptionError,
      setTransactionInProgress,
    ]
  );

  const onError = useCallback(
    (error) => {
      error.code = GENERAL_PAYPAL_ERROR_ID;
      setSubscriptionError(error);
    },
    [setSubscriptionError]
  );

  type PaypalButtonActionsType = {
    disable: () => void;
    enable: () => void;
  };

  const [paypalButtonActions, setPaypalButtonActions] =
    useState<PaypalButtonActionsType>();

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

  return (
    <>
      <div
        className={classNames({
          'disabled-overlay': disabled,
        })}
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
    </>
  );
};

export default PaypalButton;
