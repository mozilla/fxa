import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';

import * as apiClient from '../../../lib/apiClient';
import { Customer } from '../../../store/types';
import { SubscriptionCreateAuthServerAPIs } from '../SubscriptionCreate';

declare var paypal: {
  Buttons: {
    driver: Function;
  };
};

export type PaypalButtonProps = {
  apiClientOverrides?: Partial<SubscriptionCreateAuthServerAPIs>;
  customer: Customer | null;
  setPaymentError: Function;
  idempotencyKey: string;
  ButtonBase?: React.ElementType;
  currencyCode: string;
};

export type ButtonBaseProps = {
  createOrder?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onError?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const PaypalButtonBase =
  typeof paypal !== 'undefined'
    ? paypal.Buttons.driver('react', {
        React,
        ReactDOM,
      })
    : null;

export const PaypalButton = ({
  apiClientOverrides,
  customer,
  setPaymentError,
  idempotencyKey,
  ButtonBase = PaypalButtonBase,
  currencyCode,
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
      return token;
    } catch (error) {
      setPaymentError(error);
    }
    return null;
  }, [
    apiClient.apiCreateCustomer,
    apiClient.apiGetPaypalCheckoutToken,
    customer,
    setPaymentError,
    idempotencyKey,
  ]);

  const onError = useCallback(
    (error) => {
      setPaymentError(error);
    },
    [setPaymentError]
  );

  return (
    <>
      {ButtonBase && (
        <ButtonBase
          data-testid="paypal-button"
          createOrder={createOrder}
          onError={onError}
        />
      )}
    </>
  );
};

export default PaypalButton;
