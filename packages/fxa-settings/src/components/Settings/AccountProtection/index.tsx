/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ReactComponent as IconClose } from '@fxa/shared/assets/images/close.svg';
import { ReactComponent as IconShield } from '@fxa/shared/assets/images/protection-shield.svg';
import { ReactComponent as IconLock } from '@fxa/shared/assets/images/lock.svg';
import { ReactComponent as IconChevron } from '@fxa/shared/assets/images/arrow-down.svg';
import keyImage from '../../PromotionBanner/key.svg';
import { PasskeyIcon } from '../../Icons';
import { useAccount, useConfig, useFtlMsgResolver } from '../../../models';
import {
  dismissPasskeyPromo,
  isPasskeyPromoDismissed,
  PASSKEY_PROMO_DISMISS_KEYS,
} from '../../../lib/passkeys/promo';
import { getProtectionItems, ProtectionItem, ProtectionItemId } from './items';

const OPEN_KEY = '__fxa_storage.account-protection-open';

// Same tint as the Settings promo banners, so it reads as a recommendation
// rather than another settings section. The transparent border shows in
// Windows high-contrast mode.
const TINT =
  'rounded-lg bg-gradient-to-tr from-blue-600/10 to-purple-500/10 border border-transparent';

const BADGE =
  'flex items-center justify-center shrink-0 rounded-full bg-white dark:bg-grey-700 shadow-sm';

const LABELS: Record<
  ProtectionItemId,
  {
    title: string;
    action: string;
    heading: string;
    description: string;
    featuredAction: string;
  }
> = {
  passkey: {
    title: 'Create a passkey',
    action: 'Create',
    heading: 'Sign in faster with a passkey',
    description: 'Use your fingerprint, face or device PIN.',
    featuredAction: 'Create passkey',
  },
  'two-step-auth': {
    title: 'Turn on two-step authentication',
    action: 'Turn on',
    heading: 'Add a second step to sign in',
    description:
      'Use a code from an authenticator app when you sign in with your password.',
    featuredAction: 'Turn on',
  },
  'recovery-key': {
    title: 'Create an account recovery key',
    action: 'Create',
    heading: 'Keep your synced data safe',
    description:
      'An account recovery key restores it if you forget your password.',
    featuredAction: 'Create key',
  },
};

/** Recommends the protections this account can still set up. */
export const AccountProtection = () => {
  const account = useAccount();
  const config = useConfig();
  const items = getProtectionItems(account, config);

  if (items.length === 0) return null;
  if (items.length === 1) return <FeaturedItem item={items[0]} />;
  return <ProtectionDisclosure items={items} />;
};

const ProtectionDisclosure = ({ items }: { items: ProtectionItem[] }) => {
  const location = useLocation();
  const [open, setOpen] = useState(
    () => localStorage.getItem(OPEN_KEY) === 'true'
  );

  return (
    <details
      className={`${TINT} overflow-hidden`}
      data-testid="account-protection"
      open={open}
      onToggle={(e) => {
        const nowOpen = (e.currentTarget as HTMLDetailsElement).open;
        localStorage.setItem(OPEN_KEY, String(nowOpen));
        setOpen(nowOpen);
      }}
    >
      {/* A second layer of the tint makes the header a shade darker. */}
      <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden bg-gradient-to-tr from-blue-600/10 to-purple-500/10 focus-visible-default outline-offset-[-2px]">
        <span className={`${BADGE} w-10 h-10`}>
          <IconShield className="w-6 h-6" aria-hidden />
        </span>
        <span className="flex flex-col">
          <FtlMsg
            id="account-protection-heading"
            vars={{ count: items.length }}
          >
            <span className="font-bold">{`${items.length} ways to protect your account`}</span>
          </FtlMsg>
          <FtlMsg id="account-protection-note">
            <span className="text-sm text-grey-400 dark:text-grey-200">
              Optional. Together, these help keep others out and help you get
              back in if you lose access.
            </span>
          </FtlMsg>
        </span>
        <span className="ms-auto flex items-center gap-1 text-sm font-bold text-blue-500">
          {open ? (
            <FtlMsg id="account-protection-hide">Hide</FtlMsg>
          ) : (
            <FtlMsg id="account-protection-show">Show</FtlMsg>
          )}
          <IconChevron
            className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </span>
      </summary>

      <ul className="px-5 pb-1">
        {items.map(({ id, route }, i) => (
          <li
            key={id}
            className={`flex items-center gap-4 py-3 text-sm ${
              i > 0 ? 'border-t border-black/10 dark:border-white/10' : ''
            }`}
          >
            <FtlMsg id={`account-protection-${id}`}>
              <span>{LABELS[id].title}</span>
            </FtlMsg>
            <FtlMsg id={`account-protection-${id}-action`}>
              <Link
                className="ms-auto cta-neutral cta-base cta-base-p text-sm whitespace-nowrap"
                to={`${route}${location.search}`}
              >
                {LABELS[id].action}
              </Link>
            </FtlMsg>
          </li>
        ))}
      </ul>
    </details>
  );
};

const FeaturedItem = ({ item }: { item: ProtectionItem }) => {
  const location = useLocation();
  const ftlMsgResolver = useFtlMsgResolver();
  const [dismissed, setDismissed] = useState(() =>
    isPasskeyPromoDismissed(PASSKEY_PROMO_DISMISS_KEYS.settings)
  );
  if (dismissed) return null;

  const { id, route } = item;
  const label = LABELS[id];

  return (
    <section
      className={`${TINT} px-5 py-4 relative flex flex-col tablet:flex-row tablet:items-center gap-4`}
      data-testid="account-protection-featured"
    >
      <div className="flex items-center gap-4 grow pe-8">
        <FeaturedIcon id={id} />
        <div>
          <FtlMsg id={`account-protection-featured-${id}-heading`}>
            <h2 className="font-bold">{label.heading}</h2>
          </FtlMsg>
          <FtlMsg id={`account-protection-featured-${id}-description`}>
            <p className="text-sm">{label.description}</p>
          </FtlMsg>
        </div>
      </div>
      <FtlMsg id={`account-protection-featured-${id}-action`}>
        <Link
          className="cta-primary cta-base-p whitespace-nowrap tablet:me-8"
          to={`${route}${location.search}`}
        >
          {label.featuredAction}
        </Link>
      </FtlMsg>
      <button
        type="button"
        className="absolute top-3 end-3 p-1"
        aria-label={ftlMsgResolver.getMsg(
          'account-protection-dismiss',
          'Dismiss'
        )}
        onClick={() => {
          dismissPasskeyPromo(PASSKEY_PROMO_DISMISS_KEYS.settings);
          setDismissed(true);
        }}
      >
        <IconClose className="w-4 h-4" aria-hidden />
      </button>
    </section>
  );
};

const FeaturedIcon = ({ id }: { id: ProtectionItemId }) => {
  const className = 'w-8 h-8';
  return (
    <span className={`${BADGE} w-14 h-14`}>
      {id === 'passkey' ? (
        <PasskeyIcon className={className} ariaHidden />
      ) : id === 'recovery-key' ? (
        <img src={keyImage} className={className} alt="" />
      ) : (
        <IconLock className={className} aria-hidden />
      )}
    </span>
  );
};

export default AccountProtection;
