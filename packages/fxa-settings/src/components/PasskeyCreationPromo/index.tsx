/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactComponent as IconCheck } from '@fxa/shared/assets/images/check.svg';
import AppLayout from '../AppLayout';
import { Banner } from '../Banner';
import type { BannerProps } from '../Banner/interfaces';
import { useFtlMsgResolver } from '../../models';
import kitHeart from './kit-heart.svg';

/**
 * - `offer`: the promo itself.
 * - `confirm`: between the two prompts, offering the optional sync step.
 * - `retry`: the sync prompt was dismissed.
 *
 * The promo leaves once a passkey exists; the next page shows the outcome.
 */
export type PasskeyCreationPromoStep = 'offer' | 'confirm' | 'retry';

export type PasskeyCreationPromoProps = {
  step: PasskeyCreationPromoStep;
  /** The quiet line above the offer, e.g. "You’re signed in". */
  confirmation: ReactNode;
  /** Body copy under the offer heading. */
  description: ReactNode;
  onPrimary: () => void;
  onSecondary: () => void;
  busy?: boolean;
  /** Replaces the quiet confirmation, e.g. an error. */
  banner?: Pick<BannerProps, 'type' | 'content' | 'link'>;
  /** The email-code step, rendered over the offer while it runs. */
  children?: ReactNode;
};

const PRIMARY: Record<PasskeyCreationPromoStep, [string, string]> = {
  offer: ['passkey-creation-promo-create-button', 'Create passkey'],
  confirm: ['passkey-creation-promo-confirm-button', 'Confirm passkey'],
  retry: ['passkey-creation-promo-retry-button', 'Try again'],
};

const PasskeyCreationPromo = ({
  step,
  confirmation,
  description,
  onPrimary,
  onSecondary,
  busy = false,
  banner,
  children,
}: PasskeyCreationPromoProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const isSyncStep = step === 'confirm' || step === 'retry';
  const [primaryId, primaryText] = PRIMARY[step];

  return (
    <AppLayout
      title={ftlMsgResolver.getMsg(
        'passkey-creation-promo-heading',
        'Sign in faster with a passkey'
      )}
    >
      <div className="text-center">
        {banner ? (
          <Banner key="status" {...banner} />
        ) : (
          // A quiet confirmation, so the page leads with the offer.
          <p className="flex items-center justify-center gap-1 text-sm text-green-800 dark:text-green-400">
            <IconCheck className="w-4 h-4" aria-hidden />
            {step === 'confirm' ? (
              <FtlMsg id="passkey-creation-promo-created">
                Passkey created
              </FtlMsg>
            ) : (
              confirmation
            )}
          </p>
        )}

        <img src={kitHeart} alt="" className="mx-auto my-6 h-40 w-auto" />

        {isSyncStep ? (
          <FtlMsg id="passkey-creation-promo-sync-heading">
            <h1 className="card-header mb-2">
              Use your passkey with sync too?
            </h1>
          </FtlMsg>
        ) : (
          <FtlMsg id="passkey-creation-promo-heading">
            <h1 className="card-header mb-2">Sign in faster with a passkey</h1>
          </FtlMsg>
        )}

        {step === 'offer' && <p className="text-sm mb-6">{description}</p>}
        {step === 'confirm' && (
          <FtlMsg id="passkey-creation-promo-sync-description">
            <p className="text-sm mb-6">
              If you sync Firefox, confirm your passkey once more so it can also
              unlock your synced data, like passwords and bookmarks.
            </p>
          </FtlMsg>
        )}

        <FtlMsg id={primaryId}>
          <button
            type="button"
            className="cta-primary cta-xl w-full mt-4"
            onClick={onPrimary}
            disabled={busy}
          >
            {primaryText}
          </button>
        </FtlMsg>

        <div className="mt-6 text-sm">
          <FtlMsg
            id={
              step === 'offer'
                ? 'passkey-creation-promo-maybe-later-button'
                : 'passkey-creation-promo-skip-button'
            }
          >
            <button
              type="button"
              className="link-blue disabled:no-underline disabled:text-grey-500 disabled:cursor-wait"
              onClick={onSecondary}
              disabled={busy}
            >
              {step === 'offer' ? 'Maybe later' : 'Skip'}
            </button>
          </FtlMsg>
        </div>
      </div>

      {children}
    </AppLayout>
  );
};

export default PasskeyCreationPromo;
