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
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { BaseButton, ButtonVariant, CheckoutCheckbox } from '@fxa/payments/ui';
import LockImage from '@fxa/shared/assets/images/lock.svg';
import { useCallbackOnce } from '../../hooks/useCallbackOnce';
import {
  handleStripeErrorAction,
  recordEmitterEventAction,
  checkoutCartWithStripe,
  finalizeCartWithError,
  getPayPalCheckoutToken,
  checkoutCartWithPaypal,
} from '@fxa/payments/ui/actions';
import { CartErrorReasonId } from '@fxa/shared/db/mysql/account/kysely-types';
import { PaymentProvidersType } from '@fxa/payments/cart';

interface CheckoutFormProps {
  cmsCommonContent: {
    termsOfServiceUrl: string;
    privacyNoticeUrl: string;
  };
  cart: {
    id: string;
    version: number;
    email: string | null;
    uid?: string | null;
    errorReasonId: string | null;
    couponCode: string | null;
    currency: string;
    taxAddress: {
      countryCode: string;
      postalCode: string;
    };
  };
  locale: string;
  sessionExists: boolean;
}

export function CheckoutForm({
  cmsCommonContent,
  cart,
  locale,
  sessionExists,
}: CheckoutFormProps) {
  const { l10n } = useLocalization();
  const elements = useElements();
  const router = useRouter();
  const stripe = useStripe();
  const params = useParams();
  const searchParams = useSearchParams();

  const [formEnabled, setFormEnabled] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [isPaymentElementLoading, setIsPaymentElementLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stripeFieldsComplete, setStripeFieldsComplete] = useState(false);
  const [fullName, setFullName] = useState('');
  const [hasFullNameError, setHasFullNameError] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const engageGlean = useCallbackOnce(() => {
    recordEmitterEventAction(
      'checkoutEngage',
      { ...params },
      Object.fromEntries(searchParams)
    );
  }, []);

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
          setSelectedPaymentMethod(event?.value?.type || '');
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

    // Create the ConfirmationToken using the details collected by the Payment Element
    // and additional shipping information
    const { error: confirmationTokenError, confirmationToken } =
      await stripe.createConfirmationToken({
        elements,
        params: {
          payment_method_data: {
            allow_redisplay: 'always',
            billing_details: {
              name: fullName,
              address: {
                country: cart.taxAddress.countryCode,
                postal_code: cart.taxAddress.postalCode,
              },
            },
          },
        },
      });

    if (confirmationTokenError) {
      if (confirmationTokenError.type === 'validation_error') {
        return;
      } else {
        await handleStripeErrorAction(cart.id, confirmationTokenError);
        return;
      }
    }

    recordEmitterEventAction(
      'checkoutSubmit',
      { ...params },
      Object.fromEntries(searchParams),
      selectedPaymentMethod as PaymentProvidersType
    );

    await checkoutCartWithStripe(cart.id, cart.version, confirmationToken.id, {
      locale,
      displayName: fullName,
    });

    const queryParamString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : '';
    router.push('./processing' + queryParamString);
  };

  const nonStripeFieldsComplete = !!fullName;
  const showPayPalButton = selectedPaymentMethod === 'external_paypal';

  return (
    <Form.Root
      aria-label="Checkout form"
      onSubmit={submitHandler}
      onChange={() => {
        engageGlean();
      }}
    >
      <CheckoutCheckbox
        isRequired={showConsentError}
        termsOfService={cmsCommonContent.termsOfServiceUrl}
        privacyNotice={cmsCommonContent.privacyNoticeUrl}
        notifyCheckboxChange={(consentCheckbox) => {
          setFormEnabled(consentCheckbox);
          setShowConsentError(true);
        }}
        sessionExists={sessionExists}
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
            fields: {
              billingDetails: {
                address: {
                  country: 'never',
                  postalCode: 'never',
                },
              },
            },
          }}
        />
        {!isPaymentElementLoading && (
          <Form.Submit asChild>
            {showPayPalButton ? (
              <PayPalButtons
                style={{
                  layout: 'horizontal',
                  color: 'gold',
                  shape: 'rect',
                  label: 'paypal',
                  height: 48,
                  borderRadius: 6, // This should match 0.375rem
                  tagline: false,
                }}
                className="mt-6"
                createOrder={async () => getPayPalCheckoutToken(cart.currency)}
                onApprove={async (data: { orderID: string }) => {
                  await checkoutCartWithPaypal(
                    cart.id,
                    cart.version,
                    {
                      locale,
                      displayName: '',
                    },
                    data.orderID
                  );
                }}
                onError={async () => {
                  await finalizeCartWithError(
                    cart.id,
                    CartErrorReasonId.BASIC_ERROR
                  );
                  const queryParamString = searchParams.toString()
                    ? `?${searchParams.toString()}`
                    : '';

                  router.push('./error' + queryParamString);
                }}
                disabled={loading || !formEnabled}
              />
            ) : (
              <BaseButton
                className="mt-10 w-full"
                type="submit"
                variant={ButtonVariant.Primary}
                tabIndex={sessionExists ? 0 : -1}
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
