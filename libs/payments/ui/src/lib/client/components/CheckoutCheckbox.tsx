/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import * as HoverCard from '@radix-ui/react-hover-card';
import { useEffect, useState } from 'react';
import { Localized } from '@fluent/react';

interface CheckoutCheckboxProps {
  isRequired: boolean;
  termsOfService: string;
  privacyNotice: string;
  notifyCheckboxChange: (isChecked: boolean) => void;
}

export function CheckoutCheckbox({
  isRequired,
  termsOfService,
  privacyNotice,
  notifyCheckboxChange,
}: CheckoutCheckboxProps) {
  // Fluent React Overlays cause hydration issues due to SSR.
  // Using isClient along with the useEffect ensures its only run Client Side
  // Note this currently only affects strings that make use of React Overlays.
  // Other strings are localized in SSR as expected.
  // - https://github.com/projectfluent/fluent.js/wiki/React-Overlays
  // - https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => setIsClient(true), []);

  const changeHandler = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    notifyCheckboxChange(newValue);
  };

  return (
    <HoverCard.Root open={isRequired && !isChecked}>
      <label className="flex gap-5 items-center mt-6">
        <HoverCard.Trigger>
          <input
            type="checkbox"
            name="confirm"
            className="grow-0 shrink-0 basis-4 scale-150 cursor-pointer"
            checked={isChecked}
            onChange={changeHandler}
          />
        </HoverCard.Trigger>
        {isClient && (
          <Localized
            id="next-payment-confirm-with-legal-links-static-3"
            elems={{
              termsOfServiceLink: (
                <a
                  href={termsOfService}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 underline"
                >
                  Terms of Service
                </a>
              ),
              privacyNoticeLink: (
                <a
                  href={privacyNotice}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 underline"
                >
                  Privacy Notice
                </a>
              ),
            }}
          >
            <span className="font-normal text-sm block">
              I authorize Mozilla to charge my payment method for the amount
              shown, according to{' '}
              <a
                href={termsOfService}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href={privacyNotice}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline"
              >
                Privacy Notice
              </a>
              , until I cancel my subscription.
            </span>
          </Localized>
        )}
      </label>
      <HoverCard.Portal>
        <HoverCard.Content
          className="animate-slide-up z-20"
          sideOffset={20}
          align="start"
          alignOffset={50}
          arrowPadding={20}
        >
          <Localized id="next-payment-confirm-checkbox-error">
            <div className="text-white text-sm bg-alert-red py-1.5 px-4">
              You need to complete this before moving forward
            </div>
          </Localized>
          <HoverCard.Arrow className="fill-alert-red" height={11} width={22} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
