/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { PairMenuAndroidImage, PairMenuIosImage } from '../images';
import { Constants } from '../../lib/constants';

export type PairUnsupportedHintProps = {
  // A webview belongs to another app, so the user must close it first
  view: 'webview' | 'tab';
  os: 'android' | 'ios';
};

// The <ol> gives assistive tech the order, so the number is decorative.
const StepNumber = ({ children }: { children: number }) => (
  <span
    aria-hidden="true"
    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-grey-100 text-xs"
  >
    {children}
  </span>
);

export const PairUnsupportedHint = ({ view, os }: PairUnsupportedHintProps) => {
  const steps = [
    ...(view === 'webview'
      ? [
          <FtlMsg id="pair-unsupported-hint-step-close-page">
            <p className="text-base">Close this page</p>
          </FtlMsg>,
        ]
      : []),
    <FtlMsg id="pair-unsupported-hint-step-app-menu" elems={{ b: <b /> }}>
      <p className="text-base">
        Tap the <b>app menu</b>
      </p>
    </FtlMsg>,
    <FtlMsg id="pair-unsupported-hint-step-sign-in" elems={{ b: <b /> }}>
      <p className="text-base">
        <b>Sign in</b>, then scan the code
      </p>
    </FtlMsg>,
  ];

  const MenuImage = os === 'ios' ? PairMenuIosImage : PairMenuAndroidImage;

  return (
    <div className="flex flex-col items-center text-center">
      <MenuImage className="h-[120px] w-auto" />

      <FtlMsg id="pair-unsupported-hint-heading">
        <h1 className="card-header mt-4">Finish pairing in the app</h1>
      </FtlMsg>

      <ol className="mt-4 w-full rounded-xl border border-grey-100 bg-white p-4 text-start">
        {steps.map((step, index) => (
          <li key={index} className="flex items-center gap-2 p-2">
            <StepNumber>{index + 1}</StepNumber>
            {step}
          </li>
        ))}
      </ol>

      <LinkExternal
        href={Constants.PAIR_WITHOUT_QR_SUMO_URL}
        className="link-dark-grey mt-10"
      >
        <FtlMsg id="pair-unsupported-hint-learn-more-link">Learn more</FtlMsg>
      </LinkExternal>
    </div>
  );
};

export default PairUnsupportedHint;
