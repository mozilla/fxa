/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use client';

import { Localized } from '@fluent/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { getLocalizedDateString } from '@fxa/shared/l10n';
import { LinkExternal } from '@fxa/shared/react';

interface CheckoutCheckboxProps {
  isRequired: boolean;
  disabled: boolean;
  termsOfService: string;
  privacyNotice: string;
  notifyCheckboxChange: (isChecked: boolean) => void;
  isFreeTrial?: boolean;
  trialLengthDays?: number;
  locale?: string;
}

export function CheckoutCheckbox({
  isRequired,
  disabled,
  termsOfService,
  privacyNotice,
  notifyCheckboxChange,
  isFreeTrial,
  trialLengthDays,
  locale,
}: CheckoutCheckboxProps) {
  // Fluent React Overlays cause hydration issues due to SSR.
  // Using isClient along with the useEffect ensures its only run Client Side
  // Note this currently only affects strings that make use of React Overlays.
  // Other strings are localized in SSR as expected.
  // - https://github.com/projectfluent/fluent.js/wiki/React-Overlays
  // - https://nextjs.org/docs/messages/react-hydration-error
  const [isClient, setIsClient] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const trialEndUnixSeconds = useMemo(() => {
    if (!isFreeTrial || !trialLengthDays) return 0;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + trialLengthDays);
    return Math.floor(endDate.getTime() / 1000);
  }, [isFreeTrial, trialLengthDays]);

  useEffect(() => setIsClient(true), []);

  const changeHandler = () => {
    if (disabled) {
      return;
    }
    const newValue = !isChecked;
    setIsChecked(newValue);
    notifyCheckboxChange(newValue);
  };

  const trialEndDateFormatted = getLocalizedDateString(
    trialEndUnixSeconds,
    false,
    locale
  );

  return (
    <div className={clsx(disabled && 'cursor-not-allowed')}>
      {isFreeTrial && (
        <Localized
          id="checkbox-payment-required-no-charge"
          vars={{ endDate: trialEndDateFormatted }}
        >
          <span
            className={clsx(
              'block font-semibold pt-6 text-grey-600 text-start',
              disabled &&
                'pointer-events-none cursor-not-allowed relative focus:border-blue-400 focus:outline-none focus:shadow-input-blue-focus after:absolute after:content-[""] after:top-0 after:left-0 after:w-full after:h-full after:bg-white after:opacity-50 after:z-10 select-none'
            )}
          >
            A payment method is required to start your free trial. You will not
            be charged until {trialEndDateFormatted}.
          </span>
        </Localized>
      )}
      <Tooltip.Provider>
        <Tooltip.Root open={isRequired && !isChecked && !disabled}>
          <label
            className={clsx(
              'flex gap-5 items-start my-6',
              disabled &&
                'pointer-events-none cursor-not-allowed relative focus:border-blue-400 focus:outline-none focus:shadow-input-blue-focus after:absolute after:content-[""] after:top-0 after:left-0 after:w-full after:h-full after:bg-white after:opacity-50 after:z-10 select-none'
            )}
          >
            <Tooltip.Trigger asChild>
              <input
                type="checkbox"
                name="confirm"
                className="mx-1 mt-2 grow-0 shrink-0 basis-4 scale-150 cursor-pointer"
                checked={isChecked}
                onChange={changeHandler}
                required
                aria-describedby="checkboxError"
                aria-required
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
              />
            </Tooltip.Trigger>
            {isClient &&
              (isFreeTrial ? (
                <Localized
                  id="checkbox-confirm-free-trial-with-legal-links"
                  vars={{ endDate: trialEndDateFormatted }}
                  elems={{
                    termsOfServiceLink: (
                      <LinkExternal
                        href={termsOfService}
                        className="text-blue-500 underline"
                        data-testid="link-external-terms-of-service"
                        tabIndex={disabled ? -1 : 0}
                      >
                        Terms of Service
                      </LinkExternal>
                    ),
                    privacyNoticeLink: (
                      <LinkExternal
                        href={privacyNotice}
                        className="text-blue-500 underline"
                        data-testid="link-external-privacy-notice"
                        tabIndex={disabled ? -1 : 0}
                      >
                        Privacy Notice
                      </LinkExternal>
                    ),
                  }}
                >
                  <span className="font-normal text-sm leading-5 block">
                    I authorize Mozilla to charge my payment method for the
                    amount shown after the free trial ends on{' '}
                    {trialEndDateFormatted}, according to the{' '}
                    <LinkExternal
                      href={termsOfService}
                      className="text-blue-500 underline"
                      data-testid="link-external-terms-of-service"
                      tabIndex={disabled ? -1 : 0}
                    >
                      Terms of Service
                    </LinkExternal>{' '}
                    and{' '}
                    <LinkExternal
                      href={privacyNotice}
                      className="text-blue-500 underline"
                      data-testid="link-external-privacy-notice"
                      tabIndex={disabled ? -1 : 0}
                    >
                      Privacy Notice
                    </LinkExternal>
                    , until I cancel my subscription.
                  </span>
                </Localized>
              ) : (
                <Localized
                  id="next-payment-confirm-with-legal-links-static-3"
                  elems={{
                    termsOfServiceLink: (
                      <LinkExternal
                        href={termsOfService}
                        className="text-blue-500 underline"
                        data-testid="link-external-terms-of-service"
                        tabIndex={disabled ? -1 : 0}
                      >
                        Terms of Service
                      </LinkExternal>
                    ),
                    privacyNoticeLink: (
                      <LinkExternal
                        href={privacyNotice}
                        className="text-blue-500 underline"
                        data-testid="link-external-privacy-notice"
                        tabIndex={disabled ? -1 : 0}
                      >
                        Privacy Notice
                      </LinkExternal>
                    ),
                  }}
                >
                  <span className="font-normal text-sm leading-5 block">
                    I authorize Mozilla to charge my payment method for the
                    amount shown, according to{' '}
                    <LinkExternal
                      href={termsOfService}
                      className="text-blue-500 underline"
                      data-testid="link-external-terms-of-service"
                      tabIndex={disabled ? -1 : 0}
                    >
                      Terms of Service
                    </LinkExternal>{' '}
                    and{' '}
                    <LinkExternal
                      href={privacyNotice}
                      className="text-blue-500 underline"
                      data-testid="link-external-privacy-notice"
                      tabIndex={disabled ? -1 : 0}
                    >
                      Privacy Notice
                    </LinkExternal>
                    , until I cancel my subscription.
                  </span>
                </Localized>
              ))}
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
    </div>
  );
}
