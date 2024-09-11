/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import { Localized, useLocalization } from '@fluent/react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import * as Form from '@radix-ui/react-form';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { BaseButton, ButtonVariant, CheckoutCheckbox } from '@fxa/payments/ui';
import LockImage from '@fxa/shared/assets/images/lock.svg';
import { checkoutCartWithStripe } from '../../../actions/checkoutCartWithStripe';
import { handleStripeErrorAction } from '../../../actions/handleStripeError';

interface CheckoutFormProps {
  cmsCommonContent: {
    termsOfServiceUrl: string;
    privacyNoticeUrl: string;
  };
  cart: {
    id: string;
    version: number;
    email: string | null;
  };
  locale: string;
}

export function CheckoutForm({
  cmsCommonContent,
  cart,
  locale,
}: CheckoutFormProps) {
  const { l10n } = useLocalization();
  const elements = useElements();
  const router = useRouter();
  const stripe = useStripe();

  const [formEnabled, setFormEnabled] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [isPaymentElementLoading, setIsPaymentElementLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stripeFieldsComplete, setStripeFieldsComplete] = useState(false);
  const [fullName, setFullName] = useState('');
  const [hasFullNameError, setHasFullNameError] = useState(false);
  const [showPayPalButton, setShowPayPalButton] = useState(false);

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

          //Show or hide the PayPal button
          const selectedPaymentMethod = event?.value?.type;
          if (selectedPaymentMethod === 'external_paypal') {
            // Show the PayPal button
            setShowPayPalButton(true);
          } else {
            // Hide the PayPal button
            setShowPayPalButton(false);
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

    if (!stripe || !elements) {
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
        await handleStripeErrorAction(cart.id, methodError);
        return;
      }
    }

    await checkoutCartWithStripe(cart.id, cart.version, paymentMethod.id, {
      locale,
      displayName: fullName,
    });

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
    <Form.Root onSubmit={submitHandler}>
      <CheckoutCheckbox
        isRequired={showConsentError}
        termsOfService={cmsCommonContent.termsOfServiceUrl}
        privacyNotice={cmsCommonContent.privacyNoticeUrl}
        notifyCheckboxChange={(consentCheckbox) => {
          setFormEnabled(consentCheckbox);
          setShowConsentError(true);
        }}
      />
      <div
        className={
          formEnabled
            ? 'mt-10'
            : 'mt-10 cursor-not-allowed relative focus:border-blue-400 focus:outline-none focus:shadow-input-blue-focus after:absolute after:content-[""] after:top-0 after:left-0 after:w-full after:h-full after:bg-white after:opacity-50 after:z-10'
        }
        onClick={() => setShowConsentError(true)}
      >
        {!showPayPalButton && (
          <Localized id="next-new-user-card-title">
            <h3 className="font-semibold text-grey-600 text-start">
              Enter your card information
            </h3>
          </Localized>
        )}
        {!isPaymentElementLoading && !showPayPalButton && (
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
                readOnly={!formEnabled}
                tabIndex={formEnabled ? 0 : -1}
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
        )}
        <PaymentElement
          options={{
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: false,
              spacedAccordionItems: true,
            },
            readOnly: !formEnabled,
          }}
        />
        {!isPaymentElementLoading && (
          <Form.Submit asChild>
            {showPayPalButton ? (
              <PayPalButtons
                style={{
                  layout: 'horizontal',
                  color: 'gold',
                  shape: 'pill',
                  label: 'paypal',
                  height: 48,
                  tagline: false,
                }}
                className="mt-6"
              />
            ) : (
              <BaseButton
                className="mt-10 w-full"
                type="submit"
                variant={ButtonVariant.Primary}
                aria-disabled={
                  !stripeFieldsComplete || !nonStripeFieldsComplete || loading
                }
              >
                <Image src={LockImage} className="h-4 w-4 mx-3" alt="" />
                <Localized id="next-new-user-submit">Subscribe Now</Localized>
              </BaseButton>
            )}
          </Form.Submit>
        )}
      </div>
    </Form.Root>
  );
}
