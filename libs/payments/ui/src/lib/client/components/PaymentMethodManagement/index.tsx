/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import {
  BaseButton,
  ButtonVariant,
  getManagePaymentMethodErrorFtlInfo,
} from '@fxa/payments/ui';
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
  defaultPaymentMethod,
  sessionEmail,
}: {
  uid?: string;
  defaultPaymentMethod?: {
    id: string;
    type?: string;
  };
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
  const [isNonDefaultCardSelected, setIsNonDefaultCardSelected] =
    useState(false);
  const [isNonCardSelected, setIsNonCardSelected] = useState(false);
  const [hideOverflow, setHideOverflow] = useState(true);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);

  const handleReady = () => {
    setIsReady(true);
  };
  const handleElementReady = () => {
    setIsReady(true);
    setTimeout(() => setHideOverflow(false), 300);
  };

  const handlePaymentElementChange = (
    event: StripePaymentElementChangeEvent
  ) => {
    setIsComplete(event.complete);
    setError(null);
    setHasPaymentMethod(
      !!event.value.payment_method ||
      (event.value.type === 'link' && defaultPaymentMethod?.type === 'link')
    );

    if (event.value.type !== 'card') {
      setIsNonCardSelected(true);
      setIsInputNewCardDetails(false);
      if (
        event.value.payment_method?.type === 'link' &&
        defaultPaymentMethod?.type === 'link'
      ) {
        /**
         * Users can add Link to their account twice if a Link account was not associated with their Stripe
         * account email when starting the checkout flow (i.e. this was the customers first time using Link).
         * The Payment Element does not currently handle accounts with multiple Link payment methods,
         * but the user can still modify their Link payment method settings in-component.
         */
        setIsNonDefaultCardSelected(false);
      } else if (
        !!event.value.payment_method &&
        event.value.payment_method.id
      ) {
        if (event.value.payment_method.id !== defaultPaymentMethod?.id) {
          setIsNonDefaultCardSelected(true);
        } else {
          setIsNonDefaultCardSelected(false);
        }
      } else {
        setIsNonDefaultCardSelected(false);
      }
      return;
    }
    setIsNonCardSelected(false);

    if (event.value.type === 'card' && !event.value.payment_method) {
      setIsInputNewCardDetails(true);
    } else if (event.value.type === 'card' && !!event.value.payment_method) {
      setIsInputNewCardDetails(false);

      if (event.value.payment_method.id) {
        if (event.value.payment_method.id !== defaultPaymentMethod?.id) {
          setIsNonDefaultCardSelected(true);
        } else {
          setIsNonDefaultCardSelected(false);
        }
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
          : (response.setupIntent.payment_method?.id ?? '')
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
                email: sessionEmail || undefined,
              },
            },
          },
        });

      if (confirmationTokenError) {
        throw confirmationTokenError;
      }

      const { ok, result, errorMessage } = await updateStripePaymentDetails(
        uid ?? '',
        confirmationToken.id
      );
      if (!ok || !result) {
        const errorReason = getManagePaymentMethodErrorFtlInfo(errorMessage);
        setError(
          l10n.getString(errorReason.messageFtl, {}, errorReason.message)
        );
      } else {
        if (result.status === 'requires_action' && result.clientSecret) {
          await handleNextAction(result.clientSecret);
        }
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1
        className="font-bold leading-6 mt-8 px-4 pb-4 text-xl tablet:px-6"
        id="stripe-payment-management"
      >
        {l10n.getString(
          'manage-stripe-payments-title',
          {},
          'Manage payment methods'
        )}
      </h1>
      <div className="w-full py-6 text-grey-600 bg-white rounded-xl border border-grey-200 opacity-100 shadow-[0_0_16px_0_rgba(0,0,0,0.08)] tablet:px-6 tablet:py-8">
        {!isReady && (
          <div className="w-full flex bg-white bg-opacity-75 items-center justify-center">
            <LoadingSpinner className="h-10 w-10" />
          </div>
        )}
        <Form.Root
          ref={formRef}
          onSubmit={handleSubmit}
          className="px-4 tablet:px-0"
        >
          <Form.Field name="payment">
            <Form.Control asChild>
              <div
                className={`relative ${hideOverflow ? 'overflow-hidden' : ''}`}
              >
                <PaymentElement
                  onChange={handlePaymentElementChange}
                  onLoaderStart={handleReady}
                  onReady={handleElementReady}
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
          {(isInputNewCardDetails ||
            (isNonCardSelected && !hasPaymentMethod)) && (
              <div className="flex flex-row justify-center pt-4">
                <Form.Submit asChild>
                  <BaseButton
                    className="h-10 mt-10 w-full"
                    type="submit"
                    variant={ButtonVariant.Primary}
                    aria-disabled={!stripe || !isComplete || isLoading}
                    disabled={!stripe || !isComplete || isLoading}
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
    </>
  );
}
