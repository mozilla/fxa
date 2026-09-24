/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import AppLayout from '../../../../components/AppLayout';
import {
  FirefoxWordmarkImage,
  MobileDevicePairingImage,
} from '../../../../components/images';
import { PAIR_WITHOUT_QR_SUPPORT_URL } from '../../../../constants';

// The list itself carries the ordering for assistive tech, so the visible
// number is decorative.
const StepNumber = ({ children }: { children: string }) => (
  <span
    aria-hidden="true"
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-grey-100 text-xs"
  >
    {children}
  </span>
);

/**
 * The mobile screen for a user who scanned the pairing QR code with the
 * system camera instead of Firefox, but already has Firefox installed. It
 * walks them through scanning the code again from inside Firefox.
 *
 * Presentational only: nothing here depends on pairing state, and the next
 * step happens in the Firefox app rather than on this page.
 */
const PairConnectHint = () => (
  <AppLayout whiteBackground>
    <div className="flex flex-col items-center text-center">
      <FirefoxWordmarkImage className="h-8 w-24 text-black dark:text-white" />

      <MobileDevicePairingImage className="mt-10 h-[132px] w-auto" />

      <FtlMsg id="pair2-supplicant-connect-hint-heading">
        <h1 className="card-header mt-4">Continue with these steps</h1>
      </FtlMsg>
      <FtlMsg id="pair2-supplicant-connect-hint-subheading">
        <p className="mt-1 text-base">
          Use Firefox’s built-in camera to scan again
        </p>
      </FtlMsg>

      <ol className="mt-4 w-full rounded-xl border border-grey-100 bg-white p-4 text-start">
        <li className="flex items-center gap-2 p-2">
          <StepNumber>1</StepNumber>
          <FtlMsg
            id="pair2-supplicant-connect-hint-step-app-menu"
            elems={{ b: <b /> }}
          >
            <p className="text-base">
              Tap the <b>app menu</b> in the toolbar
            </p>
          </FtlMsg>
        </li>
        <li className="flex items-center gap-2 p-2">
          <StepNumber>2</StepNumber>
          <FtlMsg
            id="pair2-supplicant-connect-hint-step-sign-in"
            elems={{ b: <b /> }}
          >
            <p className="text-base">
              Tap <b>sign in</b>, then scan the code
            </p>
          </FtlMsg>
        </li>
      </ol>

      <LinkExternal
        href={PAIR_WITHOUT_QR_SUPPORT_URL}
        gleanDataAttrs={{ id: 'dtm_mobile_connect_hint_learn_more' }}
        className="link-dark-grey mt-10"
      >
        <FtlMsg id="pair2-supplicant-connect-hint-learn-more-link">
          Learn more
        </FtlMsg>
      </LinkExternal>
    </div>
  </AppLayout>
);

export default PairConnectHint;
