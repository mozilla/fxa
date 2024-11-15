/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use client';

import { Localized } from '@fluent/react';
import * as Form from '@radix-ui/react-form';
import Image from 'next/image';
import { BaseButton, ButtonVariant } from '@fxa/payments/ui';
import shieldIcon from './images/shield.svg';

const DEFAULT_NEWSLETTER_STRING_ID =
  'next-new-user-subscribe-product-updates-mozilla';

/**
 * The newsletter string is a configurable field. This function returns the correct
 * localization string ID and fallback text for the different newsletter string ID options.
 */
function getNewsletterStringInfo(newsletterLabelTextCode?: string | null) {
  switch (newsletterLabelTextCode) {
    case 'mdnplus':
      return {
        newsletterStringId: 'next-new-user-subscribe-product-updates-mdnplus',
        newsletterStringFallbackText: `I’d like to receive product news and updates from MDN Plus and Mozilla`,
      };
    case 'snp':
      return {
        newsletterStringId: 'next-new-user-subscribe-product-updates-snp',
        newsletterStringFallbackText: `I’d like to receive security and privacy news and updates from Mozilla`,
      };
    default:
      return {
        newsletterStringId: DEFAULT_NEWSLETTER_STRING_ID,
        newsletterStringFallbackText: `I’d like to receive product news and updates from Mozilla`,
      };
  }
}

interface SignInFormProps {
  submitAction: (email?: string) => Promise<void>;
  newsletterLabel?: string | null;
}

export const SignInForm = ({
  newsletterLabel,
  submitAction,
}: SignInFormProps) => {
  const { newsletterStringId, newsletterStringFallbackText } =
    getNewsletterStringInfo(newsletterLabel);
  return (
    <Form.Root
      action={async (formData: FormData) =>
        submitAction(formData.get('email')?.toString())
      }
      aria-label="Sign-in/sign-up form"
    >
      <Form.Field name="email" className="my-6">
        <Form.Label className="text-grey-400 block mb-1 text-start">
          <Localized id="checkout-enter-your-email">Enter your email</Localized>
        </Form.Label>
        <Form.Control asChild>
          <input
            className="w-full border rounded-md border-black/30 p-3 placeholder:text-grey-500 placeholder:font-normal focus:border focus:!border-black/30 focus:!shadow-[0_0_0_3px_rgba(10,132,255,0.3)] focus-visible:outline-none data-[invalid=true]:border-alert-red data-[invalid=true]:text-alert-red data-[invalid=true]:shadow-inputError"
            type="email"
            name="email"
            data-testid="email"
            required
            aria-required
          />
        </Form.Control>
        <Form.Message match="valueMissing">
          <Localized id="signin-form-email-input-missing">
            <p className="mt-1 text-alert-red" role="alert">
              Please enter your email
            </p>
          </Localized>
        </Form.Message>
        <Form.Message match="typeMismatch">
          <Localized id="signin-form-email-input-invalid">
            <p className="mt-1 text-alert-red" role="alert">
              Please provide a valid email
            </p>
          </Localized>
        </Form.Message>
      </Form.Field>

      <Form.Field
        name="newsletter"
        className="flex gap-4 items-center mb-4"
        data-testid="new-user-subscribe-product-updates"
      >
        <Form.Control asChild>
          <input
            id="newsletter-checkbox"
            type="checkbox"
            name="confirm"
            className="grow-0 shrink-0 basis-4 scale-150 cursor-pointer"
          />
        </Form.Control>

        <Form.Label htmlFor="newsletter-checkbox" className="text-sm">
          <Localized id={newsletterStringId}>
            {newsletterStringFallbackText}
          </Localized>
        </Form.Label>
      </Form.Field>

      <Form.Field
        name="assurance"
        className="flex items-center gap-4 text-sm"
        data-testid="assurance-copy"
      >
        <Image src={shieldIcon} alt="" className="-mx-2" />
        <Localized id="next-new-user-subscribe-product-assurance">
          We only use your email to create your account. We will never sell it
          to a third party.
        </Localized>
      </Form.Field>

      <Form.Submit asChild>
        <BaseButton
          className="mt-6 my-8"
          type="submit"
          variant={ButtonVariant.Primary}
        >
          <Localized id="continue">Continue</Localized>
        </BaseButton>
      </Form.Submit>
    </Form.Root>
  );
};
