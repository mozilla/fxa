/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import { Localized } from '@fluent/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useEffect, useState } from 'react';
import { LinkExternal } from '@fxa/shared/react';

interface CheckoutCheckboxProps {
  isRequired: boolean;
  termsOfService: string;
  privacyNotice: string;
  notifyCheckboxChange: (isChecked: boolean) => void;
  sessionExists: boolean;
}

export function CheckoutCheckbox({
  isRequired,
  termsOfService,
  privacyNotice,
  notifyCheckboxChange,
  sessionExists,
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
    <Tooltip.Provider>
      <Tooltip.Root open={isRequired && !isChecked}>
        <label className="flex gap-5 items-center mx-1 my-6">
          <Tooltip.Trigger asChild>
            <input
              type="checkbox"
              name="confirm"
              className="grow-0 shrink-0 basis-4 scale-150 cursor-pointer"
              checked={isChecked}
              onChange={changeHandler}
              tabIndex={sessionExists ? 0 : -1}
              required
              aria-describedby="checkboxError"
              aria-required
            />
          </Tooltip.Trigger>
          {isClient && (
            <Localized
              id="next-payment-confirm-with-legal-links-static-3"
              elems={{
                termsOfServiceLink: (
                  <LinkExternal
                    href={termsOfService}
                    className="text-blue-500 underline"
                    data-testid="link-external-terms-of-service"
                    tabIndex={sessionExists ? 0 : -1}
                  >
                    Terms of Service
                  </LinkExternal>
                ),
                privacyNoticeLink: (
                  <LinkExternal
                    href={privacyNotice}
                    className="text-blue-500 underline"
                    data-testid="link-external-privacy-notice"
                    tabIndex={sessionExists ? 0 : -1}
                  >
                    Privacy Notice
                  </LinkExternal>
                ),
              }}
            >
              <span className="font-normal text-sm leading-5 block">
                I authorize Mozilla to charge my payment method for the amount
                shown, according to{' '}
                <LinkExternal
                  href={termsOfService}
                  className="text-blue-500 underline"
                  data-testid="link-external-terms-of-service"
                >
                  Terms of Service
                </LinkExternal>{' '}
                and{' '}
                <LinkExternal
                  href={privacyNotice}
                  className="text-blue-500 underline"
                  data-testid="link-external-privacy-notice"
                >
                  Privacy Notice
                </LinkExternal>
                , until I cancel my subscription.
              </span>
            </Localized>
          )}
          <Tooltip.Portal>
            <Tooltip.Content
              id="checkboxError"
              className="animate-slide-down z-20"
              side="bottom"
              sideOffset={20}
              align="start"
              alignOffset={50}
              arrowPadding={20}
              role="alert"
            >
              <Localized id="next-payment-confirm-checkbox-error">
                <div className="text-white text-sm bg-alert-red py-1.5 px-4">
                  You need to complete this before moving forward
                </div>
              </Localized>
              <Tooltip.Arrow
                className="fill-alert-red"
                height={11}
                width={22}
              />
            </Tooltip.Content>
          </Tooltip.Portal>
        </label>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
