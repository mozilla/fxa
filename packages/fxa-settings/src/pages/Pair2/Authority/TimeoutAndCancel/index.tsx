/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../../components/AppLayout';
import { PairingInterruptedImage } from '../../../../components/images';
import GleanMetrics from '../../../../lib/glean';

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
  /** Abandons pairing. The secondary action when `reason` is `timeout`. */
  onCancel?: () => void;
  /** Sends the user to sync settings. The secondary action when `reason` is `canceled`. */
  onSyncSettings?: () => void;
};

type VariantContent = {
  headingFtlId: string;
  heading: string;
  descriptionFtlId: string;
  description: string;
  secondaryFtlId: string;
  secondaryLabel: string;
  secondaryHandler: 'onCancel' | 'onSyncSettings';
  /**
   * Per-variant because the two secondary buttons are different actions, not one
   * action relabelled — unlike "Try again", which is shared and instead carries
   * the variant in `data-glean-type`.
   */
  secondaryGleanId: string;
};

const variantContent: Record<TimeoutAndCancelReason, VariantContent> = {
  timeout: {
    headingFtlId: 'pair2-authority-timeout-and-cancel-timeout-heading',
    heading: 'Still want to connect a device?',
    descriptionFtlId: 'pair2-authority-timeout-and-cancel-timeout-description',
    description:
      'Looks like we timed out. Try again if you still want to connect your mobile device and sync your Firefox data.',
    secondaryFtlId: 'pair2-authority-timeout-and-cancel-cancel-button',
    secondaryLabel: 'Cancel',
    secondaryHandler: 'onCancel',
    secondaryGleanId: 'dtm_desktop_timeout_cancel',
  },
  canceled: {
    headingFtlId: 'pair2-authority-timeout-and-cancel-canceled-heading',
    heading: 'Canceled',
    descriptionFtlId: 'pair2-authority-timeout-and-cancel-canceled-description',
    description:
      'If you change your mind or want to connect a different device, try again.',
    secondaryFtlId: 'pair2-authority-timeout-and-cancel-sync-settings-button',
    secondaryLabel: 'Sync settings',
    secondaryHandler: 'onSyncSettings',
    secondaryGleanId: 'dtm_desktop_canceled_sync_settings',
  },
};

/**
 * The desktop screen shown once pairing stops without succeeding — either it
 * timed out or someone canceled it. Both reasons offer "Try again"; the
 * secondary action differs, because a timeout leaves the user mid-flow with
 * something to abandon while a cancel has already ended it.
 */
const TimeoutAndCancel = ({
  reason,
  onTryAgain,
  onCancel,
  onSyncSettings,
}: TimeoutAndCancelProps) => {
  reason = reason ?? 'timeout';
  const content = variantContent[reason || 'timeout'];
  const onSecondary = { onCancel, onSyncSettings }[content.secondaryHandler];

  // Custom view event rather than the automatic one: both states share a route,
  // so `reason` is the only thing that tells them apart.
  useEffect(() => {
    GleanMetrics.dtmDesktop.timeoutView({ event: { reason } });
  }, [reason]);

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
              data-glean-id="dtm_desktop_timeout_retry_submit"
              data-glean-type={reason}
              className="cta-primary cta-xl"
            >
              Try again
            </button>
          </FtlMsg>
        </div>

        <FtlMsg id={content.secondaryFtlId}>
          <button
            type="button"
            onClick={onSecondary}
            data-glean-id={content.secondaryGleanId}
            // `py-2` keeps the tap target comfortable, so the margin is halved
            // to land on the 16px gap the design asks for.
            className="mt-2 py-2 text-base text-grey-900 underline dark:text-grey-10"
          >
            {content.secondaryLabel}
          </button>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default TimeoutAndCancel;
