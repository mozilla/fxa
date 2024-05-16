/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { checkoutCartWithStripe } from '../../actions/checkoutCartWithStripe';
import { useEffect, useState } from 'react';
import { handleStripeErrorAction } from '../../actions/handleStripeError';
import LockImage from '@fxa/shared/assets/images/lock.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as Form from '@radix-ui/react-form';
import { Localized, useLocalization } from '@fluent/react';
import { PrimaryButton } from './PrimaryButton';

interface CheckoutFormProps {
  readOnly: boolean;
  cart: {
    id: string;
    version: number;
    email: string | null;
  };
}

export function CheckoutForm({ readOnly, cart }: CheckoutFormProps) {
  const router = useRouter();
  const stripe = useStripe();
  const { l10n } = useLocalization();
  const elements = useElements();
  const [isPaymentElementLoading, setIsPaymentElementLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stripeFieldsComplete, setStripeFieldsComplete] = useState(false);
  const [fullName, setFullName] = useState('');
  const [hasFullNameError, setHasFullNameError] = useState(false);

  useEffect(() => {
    if (elements) {
      const element = elements.getElement('payment');
      if (element) {
        element.on('ready', () => {
          setIsPaymentElementLoading(false);
        });

        element.on('change', (event: StripePaymentElementChangeEvent) => {
          if (event.complete) {
            setStripeFieldsComplete(true);
          } else {
            if (!stripeFieldsComplete) {
              setStripeFieldsComplete(false);
            }
          }
        });
      } else {
        setIsPaymentElementLoading(false);
      }
    }
  }, [elements, stripeFieldsComplete]);

  const submitHandler = async (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!stripe || !elements || readOnly) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    setHasFullNameError(!fullName);

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setLoading(false);
      return;
    }

    const { paymentMethod, error: methodError } =
      await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: {
            name: fullName,
            email: cart.email || '',
          },
        },
      });

    if (methodError || !paymentMethod) {
      if (methodError.type === 'validation_error') {
        return;
      } else {
        await handleStripeErrorAction(cart.id, cart.version, methodError);
        return;
      }
    }

    await checkoutCartWithStripe(cart.id, cart.version, paymentMethod.id);

    // TODO - To be added in M3B - Redirect customer to '/processing' page
    router.push('./start');
    // TODO - To be moved in M3B - Confirm Payment on '/processing' page
    // Confirm the Intent using the details collected by the Payment Element
    //const { error } = await stripe.confirmPayment({
    //  clientSecret,
    //  confirmParams: {
    //    return_url: successRedirectUrl,
    //  },
    //});
    //
    //if (error) {
    //  // This point is only reached if there's an immediate error when confirming the Intent.
    //  // Show the error to your customer (for example, "payment details incomplete").
    //  await handleStripeErrorAction(cart.id, cart.version, error);
    //} else {
    //  // Your customer is redirected to your `return_url`. For some payment
    //  // methods like iDEAL, your customer is redirected to an intermediate
    //  // site first to authorize the payment, then redirected to the `return_url`.
    //}
  };

  const nonStripeFieldsComplete = !!fullName;

  return (
    <Form.Root className="flex flex-col gap-4" onSubmit={submitHandler}>
      {!isPaymentElementLoading && (
        <Form.Field name="name" serverInvalid={hasFullNameError}>
          <Form.Label className="font-medium text-sm text-grey-400 block mb-1 text-start">
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
              readOnly={readOnly}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setHasFullNameError(!e.target.value);
              }}
            />
          </Form.Control>
          {hasFullNameError && (
            <Form.Message asChild>
              <p className="text-sm mt-1 text-alert-red">
                Please enter your name
              </p>
            </Form.Message>
          )}
        </Form.Field>
      )}
      <PaymentElement
        options={{
          layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: false,
            spacedAccordionItems: true,
          },
        }}
      />
      {!isPaymentElementLoading && (
        <Form.Submit asChild>
          <Localized id="next-new-user-submit">
            <PrimaryButton
              type="submit"
              aria-disabled={
                !stripeFieldsComplete || !nonStripeFieldsComplete || loading
              }
            >
              <Image
                src={LockImage}
                className="h-4 w-4 my-0 mx-3 relative top-0.5"
                alt=""
              />
              Subscribe Now
            </PrimaryButton>
          </Localized>
        </Form.Submit>
      )}
    </Form.Root>
  );
}
