import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';

import * as apiClient from '../../lib/apiClient';
import { Customer } from '../../store/types';
import { SubscriptionCreateAuthServerAPIs } from '../../routes/Product/SubscriptionCreate';

declare var paypal: {
  Buttons: {
    driver: Function;
  };
};

export type PaypalButtonProps = {
  currencyCode: string;
  customer: Customer | null;
  idempotencyKey: string;
  refreshSubscriptions: () => void;
  setPaymentError: Function;
  priceId?: string;
  newPaypalAgreement?: boolean;
  apiClientOverrides?: Partial<SubscriptionCreateAuthServerAPIs>;
  setTransactionInProgress?: Function;
  ButtonBase?: React.ElementType;
};

export type ButtonBaseProps = {
  createOrder?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onApprove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onError?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

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
  refreshSubscriptions,
  setPaymentError,
  priceId,
  newPaypalAgreement,
  apiClientOverrides,
  setTransactionInProgress,
  ButtonBase = PaypalButtonBase,
}: PaypalButtonProps) => {
  const createOrder = useCallback(async () => {
    try {
      const { apiCreateCustomer, apiGetPaypalCheckoutToken } = {
        ...apiClient,
        ...apiClientOverrides,
      };
      if (!customer) {
        await apiCreateCustomer({
          idempotencyKey,
        });
      }
      const { token } = await apiGetPaypalCheckoutToken({ currencyCode });
      /* istanbul ignore next */
      return token;
    } catch (error) {
      if (!error.code) {
        error.code = 'general-paypal-error';
      }
      setPaymentError(error);
    }
    return null;
  }, [
    apiClient.apiCreateCustomer,
    apiClient.apiGetPaypalCheckoutToken,
    customer,
    idempotencyKey,
    setPaymentError,
  ]);

  const onApprove = useCallback(
    async (data: { orderID: string }) => {
      /* istanbul ignore next */
      try {
        if (setTransactionInProgress) setTransactionInProgress(true);
        const { apiCapturePaypalPayment, apiUpdateBillingAgreement } = {
          ...apiClient,
          ...apiClientOverrides,
        };
        // This is the same token as obtained in createOrder
        const token = data.orderID;
        if (newPaypalAgreement && priceId) {
          await apiCapturePaypalPayment({
            idempotencyKey,
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
        if (!error.code) {
          error.code = 'general-paypal-error';
        }
        setPaymentError(error);
      }
      return null;
    },
    [
      apiClient.apiCreateCustomer,
      apiClient.apiGetPaypalCheckoutToken,
      customer,
      idempotencyKey,
      setPaymentError,
    ]
  );

  const onError = useCallback(
    (error) => {
      error.code = 'general-paypal-error';
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
