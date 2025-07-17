// /* This Source Code Form is subject to the terms of the Mozilla Public
// * License, v. 2.0. If a copy of the MPL was not distributed with this
// * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import * as Form from '@radix-ui/react-form';
import { LoadingSpinner } from '../LoadingSpinner';
import { useState, useRef } from 'react';
import {
  StripePaymentElementChangeEvent,
  StripeError,
} from '@stripe/stripe-js';
import { Localized, useLocalization } from '@fluent/react';

export function PaymentMethodManagement({
  onSubmit,
}: {
  onSubmit: (confirmationTokenId: string) => any;
}) {
  const { l10n } = useLocalization();
  const stripe = useStripe();
  const elements = useElements();
  const formRef = useRef<HTMLFormElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInputNewCardDetails, setIsInputNewCardDetails] = useState(false);
  const [fullName, setFullName] = useState('');
  const [hasFullNameError, setHasFullNameError] = useState(false);

  const handleReady = () => {
    setIsReady(true);
  };

  const handlePaymentElementChange = (
    event: StripePaymentElementChangeEvent
  ) => {
    console.log(event);
    setIsComplete(event.complete);

    if (event.value.type === 'card' && !event.value.payment_method) {
      setIsInputNewCardDetails(true);
    } else if (event.value.type === 'card' && !!event.value.payment_method) {
      setIsInputNewCardDetails(false);
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
      // TODO: Implement ConfirmationToken flow
      // 1. Create confirmation token with elements.createConfirmationToken()
      // 2. Send token to backend to save payment method
      // 3. Handle success/error responses

      // Placeholder for ConfirmationToken creation
      elements.submit();
      const { confirmationToken, error: confirmationTokenError } =
        await stripe.createConfirmationToken({
          elements,
          params: {
            // TODO: Add required parameters for saving payment method
            // return_url: window.location.href,
          },
        });

      if (confirmationTokenError) {
        throw confirmationTokenError;
      }

      await onSubmit(confirmationToken.id);

      // TODO: Send confirmation token to backend
      // const response = await fetch('/api/save-payment-method', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ confirmationToken: confirmationToken.id }),
      // });

      // TODO: Handle backend response and call onSuccess
      console.log('success', confirmationToken.id);
    } catch (err) {
      const stripeError = err as StripeError;
      setError(stripeError.message || 'An unexpected error occurred.');
      console.log('error', stripeError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      {!isReady && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}
      <Form.Root ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {isInputNewCardDetails && (
          <>
            <Localized id="next-new-user-card-title">
              <h3 className="font-semibold text-grey-600 text-start">
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
                    <p className="mt-1 text-alert-red" role="alert">
                      Please enter your name
                    </p>
                  </Localized>
                </Form.Message>
              )}
            </Form.Field>
          </>
        )}
        <Form.Field name="payment">
          <Form.Control asChild>
            <div className="relative">
              <PaymentElement
                onChange={handlePaymentElementChange}
                onReady={handleReady}
                options={{
                  layout: {
                    type: 'accordion',
                    defaultCollapsed: false,
                    radios: false,
                    spacedAccordionItems: true,
                  },
                  terms: {
                    card: 'never',
                  },
                }}
              />
            </div>
          </Form.Control>

          {error && (
            <Form.Message className="text-red-600 text-sm mt-2">
              {error}
            </Form.Message>
          )}
        </Form.Field>

        {isInputNewCardDetails && (
          <div className="flex flex-row justify-center">
            <Form.Submit asChild>
              <button
                type="submit"
                disabled={!stripe || !isComplete || isLoading}
                className="w-md bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Save as default'
                )}
              </button>
            </Form.Submit>
          </div>
        )}
      </Form.Root>
    </div>
  );
}
