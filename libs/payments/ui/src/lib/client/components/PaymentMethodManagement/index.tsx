/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { BaseButton, ButtonVariant } from '@fxa/payments/ui';
import * as Form from '@radix-ui/react-form';
import Image from 'next/image';
import spinnerWhiteImage from '@fxa/shared/assets/images/spinnerwhite.svg';
import { LoadingSpinner } from '../LoadingSpinner';
import { useState, useRef } from 'react';
import { StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { Localized, useLocalization } from '@fluent/react';
import { useRouter } from 'next/navigation';
import {
  updateStripePaymentDetails,
  setDefaultStripePaymentDetails,
} from '@fxa/payments/ui/actions';

export function PaymentMethodManagement({
  uid,
  defaultPaymentMethodId,
  sessionEmail,
}: {
  uid?: string;
  defaultPaymentMethodId?: string;
  sessionEmail?: string;
}) {
  const { l10n } = useLocalization();
  const stripe = useStripe();
  const elements = useElements();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInputNewCardDetails, setIsInputNewCardDetails] = useState(false);
  const [fullName, setFullName] = useState('');
  const [hasFullNameError, setHasFullNameError] = useState(false);
  const [isNonDefaultCardSelected, setIsNonDefaultCardSelected] =
    useState(false);
  const [isNonCardSelected, setIsNonCardSelected] = useState(false);

  const handleReady = () => {
    setIsReady(true);
  };

  const handlePaymentElementChange = (
    event: StripePaymentElementChangeEvent
  ) => {
    setIsComplete(event.complete);

    if (event.value.type !== 'card') {
      setIsNonCardSelected(true);
      setIsInputNewCardDetails(false);
      setHasFullNameError(false);
      return;
    }
    setIsNonCardSelected(false);

    if (event.value.type === 'card' && !event.value.payment_method) {
      setIsInputNewCardDetails(true);

      if (event.complete) {
        setHasFullNameError(fullName.length === 0);
      }
    } else if (event.value.type === 'card' && !!event.value.payment_method) {
      setIsInputNewCardDetails(false);

      if (event.value.payment_method.id !== defaultPaymentMethodId) {
        setIsNonDefaultCardSelected(true);
      } else {
        setIsNonDefaultCardSelected(false);
      }
    }
  };

  const handleNextAction = async (clientSecret: string) => {
    if (!stripe) return;
    const response = await stripe.handleNextAction({
      clientSecret: clientSecret,
    });

    if (response.error) {
      throw response.error;
    }

    if (
      response.setupIntent?.status === 'requires_action' &&
      response.setupIntent.client_secret
    ) {
      return await handleNextAction(response.setupIntent.client_secret);
    } else if (response.setupIntent?.status === 'succeeded') {
      await setDefaultStripePaymentDetails(
        uid ?? '',
        typeof response.setupIntent.payment_method === 'string'
          ? response.setupIntent.payment_method
          : (response.setupIntent.payment_method?.id ?? ''),
        fullName
      );
    } else {
      throw new Error('We could not confirm your payment method');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !isComplete) {
      return;
    }

    if (isInputNewCardDetails && !fullName) {
      setHasFullNameError(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setIsLoading(false);
        setError(submitError.message || 'An unexpected error occurred.');
        return;
      }

      const { confirmationToken, error: confirmationTokenError } =
        await stripe.createConfirmationToken({
          elements,
          params: {
            payment_method_data: {
              billing_details: {
                name: fullName,
                email: sessionEmail || undefined,
              },
            },
          },
        });

      if (confirmationTokenError) {
        throw confirmationTokenError;
      }

      const response = await updateStripePaymentDetails(
        uid ?? '',
        confirmationToken.id
      );

      if (response.status === 'requires_action' && response.clientSecret) {
        await handleNextAction(response.clientSecret);
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      {!isReady && (
        <div className="w-full flex bg-white bg-opacity-75 items-center justify-center">
          <LoadingSpinner className="h-10 w-10" />
        </div>
      )}
      {isReady && (
        <h2
          className="font-semibold mb-4 text-lg"
          id="stripe-payment-management"
        >
          {l10n.getString(
            'manage-stripe-payments-title',
            {},
            'Manage payment methods'
          )}
        </h2>
      )}
      <Form.Root ref={formRef} onSubmit={handleSubmit}>
        {isInputNewCardDetails && (
          <>
            <Localized id="next-new-user-card-title">
              <h3 className="font-semibold text-grey-600 text-start mt-6">
                Enter your card information
              </h3>
            </Localized>
            <Form.Field
              name="name"
              serverInvalid={hasFullNameError}
              className="my-6"
            >
              <Form.Label className="text-grey-400 block mb-1 text-start">
                <Localized id="payment-name-label">
                  Name as it appears on your card
                </Localized>
              </Form.Label>
              <Form.Control asChild>
                <input
                  className="w-full border rounded-md border-black/30 p-3 placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none data-[invalid=true]:border-alert-red data-[invalid=true]:text-alert-red data-[invalid=true]:shadow-inputError"
                  type="text"
                  data-testid="name"
                  placeholder={l10n.getString(
                    'payment-name-placeholder',
                    {},
                    'Full Name'
                  )}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setHasFullNameError(!e.target.value);
                  }}
                  aria-required
                />
              </Form.Control>
              {hasFullNameError && (
                <Form.Message asChild>
                  <Localized id="next-payment-validate-name-error">
                    <p className="mt-1 text-alert-red font-normal" role="alert">
                      Please enter your full name
                    </p>
                  </Localized>
                </Form.Message>
              )}
            </Form.Field>
          </>
        )}
        <Form.Field name="payment">
          <Form.Control asChild>
            <div className="relative overflow-hidden">
              <PaymentElement
                onChange={handlePaymentElementChange}
                onLoaderStart={handleReady}
                options={{
                  layout: {
                    type: 'accordion',
                    defaultCollapsed: false,
                    radios: false,
                    spacedAccordionItems: true,
                  },
                  defaultValues: {
                    billingDetails: {
                      email: sessionEmail || undefined,
                    },
                  },
                }}
              />
            </div>
          </Form.Control>

          {error && (
            <Form.Message>
              <div className="mt-5 text-alert-red font-normal">{error}</div>
            </Form.Message>
          )}
        </Form.Field>
        {(isInputNewCardDetails || isNonCardSelected) && (
          <div className="flex flex-row justify-center pt-4">
            <Form.Submit asChild>
              <BaseButton
                className="h-10 mt-10 w-full"
                type="submit"
                variant={ButtonVariant.Primary}
                aria-disabled={
                  !stripe || !isComplete || isLoading || hasFullNameError
                }
                disabled={
                  !stripe || !isComplete || isLoading || hasFullNameError
                }
              >
                {isLoading ? (
                  <Image
                    src={spinnerWhiteImage}
                    alt=""
                    className="absolute animate-spin h-8 w-8"
                  />
                ) : (
                  <Localized id="payment-method-management-save-method">
                    Save payment method
                  </Localized>
                )}
              </BaseButton>
            </Form.Submit>
          </div>
        )}
        {isNonDefaultCardSelected && !isInputNewCardDetails && (
          <div className="flex flex-row justify-center pt-4">
            <Form.Submit asChild>
              <BaseButton
                className="h-10 mt-10 w-full"
                type="submit"
                variant={ButtonVariant.Primary}
                aria-disabled={!stripe || !isComplete || isLoading}
              >
                {isLoading ? (
                  <Image
                    src={spinnerWhiteImage}
                    alt=""
                    className="absolute animate-spin h-8 w-8"
                  />
                ) : (
                  <Localized id="payment-method-management-save-default">
                    Set as default payment method
                  </Localized>
                )}
              </BaseButton>
            </Form.Submit>
          </div>
        )}
      </Form.Root>
    </div>
  );
}
