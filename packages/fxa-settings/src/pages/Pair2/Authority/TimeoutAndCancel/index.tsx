/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../../components/AppLayout';
import { PairingInterruptedImage } from '../../../../components/images';

/**
 * Why pairing stopped. Shared verbatim with the mobile twin,
 * `Pair2/Supplicant/TimeoutAndCancel`, so a route can pick a card without
 * translating the value.
 */
export type TimeoutAndCancelReason = 'timeout' | 'canceled';

export type TimeoutAndCancelProps = {
  reason?: TimeoutAndCancelReason;
  /** Restarts pairing. The only action shared by both reasons. */
  onTryAgain?: () => void;
  /** Sends the user to sync settings. The secondary action when `reason` is `canceled`. */
  onSyncSettings?: () => void;
};

type VariantContent = {
  headingFtlId: string;
  heading: string;
  descriptionFtlId: string;
  description: string;
  /** Text link under "Try again". Absent when retrying is the only way forward. */
  secondary?: {
    ftlId: string;
    label: string;
  };
};

const variantContent: Record<TimeoutAndCancelReason, VariantContent> = {
  timeout: {
    headingFtlId: 'pair2-authority-timeout-and-cancel-timeout-heading',
    heading: 'Still want to connect a device?',
    descriptionFtlId: 'pair2-authority-timeout-and-cancel-timeout-description',
    description:
      'Looks like we timed out. Try again if you still want to connect your mobile device and sync your Firefox data.',
  },
  canceled: {
    headingFtlId: 'pair2-authority-timeout-and-cancel-canceled-heading',
    heading: 'Canceled',
    descriptionFtlId: 'pair2-authority-timeout-and-cancel-canceled-description',
    description:
      'If you change your mind or want to connect a different device, try again.',
    secondary: {
      ftlId: 'pair2-authority-timeout-and-cancel-sync-settings-button',
      label: 'Sync settings',
    },
  },
};

/**
 * The desktop screen shown once pairing stops without succeeding — either it
 * timed out or someone canceled it. Both reasons offer "Try again". A timeout
 * offers nothing else: the user is already signed in on this computer, so
 * there is nothing to abandon and a Cancel would only route them back to the
 * sign-in page. A cancel adds a link to Sync settings.
 */
const TimeoutAndCancel = ({
  reason,
  onTryAgain,
  onSyncSettings,
}: TimeoutAndCancelProps) => {
  const content = variantContent[reason ?? 'timeout'];

  return (
    <AppLayout>
      <div className="flex flex-col items-center text-center">
        <FtlMsg id={content.headingFtlId}>
          <h1 className="card-header">{content.heading}</h1>
        </FtlMsg>
        <FtlMsg id={content.descriptionFtlId}>
          <p className="mt-1 text-base">{content.description}</p>
        </FtlMsg>

        <PairingInterruptedImage className="mt-8 h-[136px] w-auto" />

        <div className="mt-8 flex w-full">
          <FtlMsg id="pair2-authority-timeout-and-cancel-try-again-button">
            <button
              type="button"
              onClick={onTryAgain}
              className="cta-primary cta-xl"
            >
              Try again
            </button>
          </FtlMsg>
        </div>

        {content.secondary && (
          <FtlMsg id={content.secondary.ftlId}>
            <button
              type="button"
              onClick={onSyncSettings}
              // `py-2` keeps the tap target comfortable, so the margin is halved
              // to land on the 16px gap the design asks for.
              className="mt-2 py-2 text-base text-grey-900 underline dark:text-grey-10"
            >
              {content.secondary.label}
            </button>
          </FtlMsg>
        )}
      </div>
    </AppLayout>
  );
};

export default TimeoutAndCancel;
