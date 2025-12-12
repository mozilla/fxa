/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import { Localized, } from '@fluent/react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import * as Form from '@radix-ui/react-form';
import Stripe from 'stripe';
import {
  PaymentElement,
  useStripe,
  useElements,
  LinkAuthenticationElement,
} from '@stripe/react-stripe-js';
import {
  ConfirmationTokenCreateParams,
  StripePaymentElementChangeEvent,
} from '@stripe/stripe-js';
import Image from 'next/image';
import {
  ReadonlyURLSearchParams,
  useParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';
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
import PaypalIcon from '@fxa/shared/assets/images/payment-methods/paypal.svg';
import spinnerWhiteImage from '@fxa/shared/assets/images/spinnerwhite.svg';

const getAttributionParams = (searchParams: ReadonlyURLSearchParams) => {
  const paramsRecord = Object.fromEntries(searchParams);
  return {
    utm_campaign: paramsRecord['utm_campaign'] ?? '',
    utm_content: paramsRecord['utm_content'] ?? '',
    utm_medium: paramsRecord['utm_medium'] ?? '',
    utm_source: paramsRecord['utm_source'] ?? '',
    utm_term: paramsRecord['utm_term'] ?? '',
    session_flow_id: paramsRecord['flow_id'] ?? '',
    session_entrypoint: paramsRecord['entrypoint'] ?? '',
    session_entrypoint_experiment: paramsRecord['entrypoint_experiment'] ?? '',
    session_entrypoint_variation: paramsRecord['entrypoint_variation'] ?? '',
  };
};

interface CheckoutFormProps {
  cmsCommonContent: {
    termsOfServiceUrl: string;
    privacyNoticeUrl: string;
  };
  cart: {
    id: string;
    version: number;
    uid?: string | null;
    errorReasonId: string | null;
    couponCode: string | null;
    currency: string;
    taxAddress: {
      countryCode: string;
      postalCode: string;
    };
    paymentInfo?: {
      type:
        | Stripe.PaymentMethod.Type
        | 'google_iap'
        | 'apple_iap'
        | 'external_paypal';
      last4?: string;
      brand?: string;
      customerSessionClientSecret?: string;
      walletType?: string;
    };
  };
  locale: string;
  sessionUid?: string;
  sessionEmail?: string;
}

export function CheckoutForm({
  cmsCommonContent,
  cart,
  locale,
  sessionUid,
  sessionEmail,
}: CheckoutFormProps) {
  const elements = useElements();
  const router = useRouter();
  const stripe = useStripe();
  const params = useParams();
  const searchParams = useSearchParams();
  const searchParamsRecord: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    searchParamsRecord[key] = value;
  }

  const [formEnabled, setFormEnabled] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [isPaymentElementLoading, setIsPaymentElementLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stripeFieldsComplete, setStripeFieldsComplete] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isSavedPaymentMethod, setIsSavedPaymentMethod] = useState(
    !!cart?.paymentInfo?.type
  );
  const [showLinkAuthElement, setShowLinkAuthElement] = useState(false);
  const linkAuthOptions = sessionEmail
    ? { defaultValues: { email: sessionEmail } }
    : {};

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

          //Show or hide the PayPal button and Link
          const hasSavedPaymentMethod = !!event?.value?.payment_method?.id;
          const isNewCardSelected =
            event?.value?.type === 'card' && !hasSavedPaymentMethod;

          setShowLinkAuthElement(isNewCardSelected && hasSavedPaymentMethod);

          setSelectedPaymentMethod(event?.value?.type || '');
          setIsSavedPaymentMethod(hasSavedPaymentMethod);
        });
      } else {
        setIsPaymentElementLoading(false);
      }
    }
  }, [elements, stripeFieldsComplete]);

  const showPayPalButton = selectedPaymentMethod === 'external_paypal';
  const isStripe = cart?.paymentInfo?.type !== 'external_paypal';

  const submitHandler = async (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!stripe || !elements || loading) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    if (cart?.paymentInfo?.type === 'external_paypal') {
      recordEmitterEventAction(
        'checkoutSubmit',
        { ...params },
        Object.fromEntries(searchParams),
        'external_paypal'
      );

      await checkoutCartWithPaypal(
        cart.id,
        cart.version,
        {
          locale,
          displayName: '',
        },
        getAttributionParams(searchParams),
        sessionUid
      );

      const queryParamString = searchParams.toString()
        ? `?${searchParams.toString()}`
        : '';
      router.push('./processing' + queryParamString);

      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setLoading(false);
      return;
    }

    const paymentElement = elements.getElement(PaymentElement);
    if (!paymentElement) {
      setLoading(false);
      return;
    }

    const confirmationTokenParams: ConfirmationTokenCreateParams | undefined =
      !isSavedPaymentMethod
        ? {
            payment_method_data: {
              billing_details: {
                email: sessionEmail || undefined,
              },
            },
          }
        : undefined;

    // Create the ConfirmationToken using the details collected by the Payment Element
    // and additional shipping information
    const { error: confirmationTokenError, confirmationToken } =
      await stripe.createConfirmationToken({
        elements,
        params: confirmationTokenParams,
      });

    if (confirmationTokenError) {
      if (confirmationTokenError.type === 'validation_error') {
        setLoading(false);
        return;
      } else {
        await handleStripeErrorAction(
          cart.id,
          confirmationTokenError,
          searchParamsRecord
        );
        setLoading(false);
        return;
      }
    }

    recordEmitterEventAction(
      'checkoutSubmit',
      { ...params },
      Object.fromEntries(searchParams),
      selectedPaymentMethod as PaymentProvidersType
    );

    await checkoutCartWithStripe(
      cart.id,
      cart.version,
      confirmationToken.id,
      {
        locale,
      },
      getAttributionParams(searchParams),
      sessionUid
    );

    const queryParamString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : '';
    router.push('./processing' + queryParamString);
  };

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
        disabled={!cart.uid}
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
        {cart?.paymentInfo?.type === 'external_paypal' ? (
          <div className="bg-white rounded-lg border border-[#e6e6e6] shadow-stripeBox">
            <h3 className="p-4 text-sm text-[#0570de] font-semibold">Saved</h3>
            <div className="p-4 pt-2 rounded-lg">
              <div className="bg-white p-4 rounded-lg border border-[#e6e6e6] shadow-stripeBox">
                <Image src={PaypalIcon} alt="paypal" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {showLinkAuthElement && (
              <div>
                <LinkAuthenticationElement options={linkAuthOptions} />
              </div>
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
                terms: {
                  card: 'never',
                },
                defaultValues: {
                  billingDetails: {
                    email: sessionEmail || undefined,
                    address: {
                      country: cart.taxAddress.countryCode,
                    },
                  },
                },
              }}
            />
          </>
        )}
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
                className="mt-6 flex justify-center w-full"
                createOrder={async () => getPayPalCheckoutToken(cart.currency)}
                onApprove={async (data: { orderID: string }) => {
                  await checkoutCartWithPaypal(
                    cart.id,
                    cart.version,
                    {
                      locale,
                      displayName: '',
                    },
                    getAttributionParams(searchParams),
                    sessionUid,
                    data.orderID
                  );
                  const queryParamString = searchParams.toString()
                    ? `?${searchParams.toString()}`
                    : '';
                  router.push('./processing' + queryParamString);
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
                className="h-12 mt-10 w-full"
                type="submit"
                variant={ButtonVariant.Primary}
                aria-disabled={
                  !formEnabled ||
                  (isStripe && !stripeFieldsComplete) ||
                  loading
                }
              >
                {loading ? (
                  <Image
                    src={spinnerWhiteImage}
                    alt=""
                    className="absolute animate-spin h-8 w-8"
                  />
                ) : (
                  <>
                    <Image src={LockImage} className="h-4 w-4 mx-3" alt="" />
                    {isStripe ? (
                      <Localized id="next-new-user-submit">
                        Subscribe Now
                      </Localized>
                    ) : (
                      <Localized id="next-pay-with-heading-paypal">
                        Pay with PayPal
                      </Localized>
                    )}
                  </>
                )}
              </BaseButton>
            )}
          </Form.Submit>
        )}
      </div>
    </Form.Root>
  );
}
