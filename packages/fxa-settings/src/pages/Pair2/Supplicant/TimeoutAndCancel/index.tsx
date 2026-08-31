/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement, useEffect } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../../components/AppLayout';
import {
  FirefoxWordmarkImage,
  PairingInterruptedImage,
} from '../../../../components/images';
import GleanMetrics from '../../../../lib/glean';

/**
 * Why the pairing attempt ended without connecting. Named for the cause rather
 * than the screen, because that is what the caller knows at the point it routes
 * here — the two states are otherwise the same card.
 */
export type PairingInterruptionReason = 'timeout' | 'canceled';

/**
 * The only thing that varies between the two states. Keyed by reason so the
 * component stays a single card, and each state keeps its own Fluent messages —
 * the sentences differ in structure, not just in a word, so they cannot share
 * one parameterised message.
 */
const COPY: Record<
  PairingInterruptionReason,
  {
    headingFtlId: string;
    heading: string;
    descriptionFtlId: string;
    /**
     * Fallback markup rather than a string: both sentences emphasise the pairing
     * URL through a `<b>` the Fluent message wraps, so the fallback has to carry
     * a real element instead of the tags as text.
     */
    description: ReactElement;
  }
> = {
  timeout: {
    headingFtlId: 'pair2-supplicant-timeout-and-cancel-timeout-heading',
    heading: 'Looks like we timed out',
    descriptionFtlId: 'pair2-supplicant-timeout-and-cancel-timeout-description',
    description: (
      <>
        To connect your mobile device and sync your Firefox data, visit{' '}
        <b className="whitespace-nowrap">firefox.com/pair</b> on your computer.
      </>
    ),
  },
  canceled: {
    headingFtlId: 'pair2-supplicant-timeout-and-cancel-canceled-heading',
    heading: 'Canceled',
    descriptionFtlId:
      'pair2-supplicant-timeout-and-cancel-canceled-description',
    description: (
      <>
        To connect a device anytime, visit{' '}
        <b className="whitespace-nowrap">firefox.com/pair</b> on your computer.
      </>
    ),
  },
};

export type TimeoutAndCancelProps = {
  /** Which of the two dead-end states to show. */
  reason?: PairingInterruptionReason;
};

/**
 * The mobile dead-end screen shown when pairing ends without connecting, either
 * because it timed out or because it was canceled. Both states are purely
 * informational — the designs give them no button and no link, so the user
 * restarts from `firefox.com/pair` on their computer.
 */
const TimeoutAndCancel = ({ reason }: TimeoutAndCancelProps) => {
  reason = reason ?? 'timeout';
  const { headingFtlId, heading, descriptionFtlId, description } = COPY[reason];

  // Custom view event rather than the automatic one: both states share a route,
  // so `reason` is the only thing that tells them apart.
  useEffect(() => {
    GleanMetrics.dtmMobile.timeoutView({ event: { reason } });
  }, [reason]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center text-center">
        <FirefoxWordmarkImage className="h-8 w-24 text-black dark:text-white" />

        <PairingInterruptedImage className="mt-12 h-[104px] w-auto" />

        <FtlMsg id={headingFtlId}>
          <h1 className="card-header mt-6">{heading}</h1>
        </FtlMsg>
        <FtlMsg
          id={descriptionFtlId}
          elems={{ b: <b className="whitespace-nowrap" /> }}
        >
          <p className="mt-1 text-base">{description}</p>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default TimeoutAndCancel;
