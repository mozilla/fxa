import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';

import * as apiClient from '../../lib/apiClient';
import { Customer } from '../../store/types';
import { SubscriptionCreateAuthServerAPIs } from '../../routes/Product/SubscriptionCreate';
import { PaymentUpdateAuthServerAPIs } from '../../routes/Subscriptions/PaymentUpdateForm';

declare var paypal: {
  Buttons: {
    driver: Function;
  };
};

export type PaypalButtonProps = {
  currencyCode: string;
  customer: Customer | null;
  idempotencyKey: string;
  refreshSubmitNonce: () => void;
  refreshSubscriptions: () => void;
  beforeCreateOrder?: () => Promise<void>;
  setPaymentError: Function;
  priceId?: string;
  newPaypalAgreement?: boolean;
  apiClientOverrides?: Partial<
    SubscriptionCreateAuthServerAPIs | PaymentUpdateAuthServerAPIs
  >;
  setTransactionInProgress?: Function;
  ButtonBase?: React.ElementType;
};

export type ButtonBaseProps = {
  createOrder?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onApprove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onError?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
  idempotencyKey,
  refreshSubmitNonce,
  refreshSubscriptions,
  beforeCreateOrder,
  setPaymentError,
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
      setPaymentError(error);
    }
    return null;
  }, [apiClientOverrides, currencyCode, setPaymentError, beforeCreateOrder]);

  const onApprove = useCallback(
    async (data: { orderID: string }) => {
      const isNewSubscription = newPaypalAgreement && priceId;
      /* istanbul ignore next */
      try {
        if (setTransactionInProgress) setTransactionInProgress(true);
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
        refreshSubscriptions();
      } catch (error) {
        if (isNewSubscription) {
          if (!error.code) {
            error.code = GENERAL_PAYPAL_ERROR_ID;
          }
          setPaymentError(error);
        } else {
          refreshSubscriptions();
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
      refreshSubscriptions,
      setPaymentError,
      setTransactionInProgress,
    ]
  );

  const onError = useCallback(
    (error) => {
      error.code = GENERAL_PAYPAL_ERROR_ID;
      setPaymentError(error);
    },
    [setPaymentError]
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
      {ButtonBase && (
        <ButtonBase
          style={styleOptions}
          data-testid="paypal-button"
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
        />
      )}
    </>
  );
};

export default PaypalButton;
