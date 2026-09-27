/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Visual prototypes only: no submit handling, no l10n.

import React, { useState } from 'react';
import mozLogo from '@fxa/shared/assets/images/moz-logo-bw-rgb.svg';
import { ReactComponent as GoogleLogo } from '../../../components/ThirdPartyAuth/google-logo-viewbox.svg';
import { ReactComponent as AppleLogo } from '../../../components/ThirdPartyAuth/apple-logo-cropped-black.svg';
import { PasskeyIcon } from '../../../components/Icons';
import { SyncCloudsImage } from '../../../components/images';

const providers = [
  { Icon: GoogleLogo, name: 'Google' },
  { Icon: AppleLogo, name: 'Apple' },
  { Icon: PasskeyIcon, name: 'Passkey' },
];

const Terms = ({ className = '' }: { className?: string }) => (
  <p className={`text-xs text-grey-400 ${className}`}>
    By continuing, you agree to the{' '}
    <span className="underline">Terms of Service</span> and{' '}
    <span className="underline">Privacy Notice</span>.
  </p>
);

/** 1. Split hero: brand story on the left, compact form on the right. */
export const SplitHero = () => (
  <div className="min-h-screen flex flex-col desktop:flex-row">
    <section className="desktop:w-3/5 bg-gradient-to-br from-violet-900 via-purple-700 to-orange-500 text-white p-8 desktop:p-16 flex flex-col justify-between">
      <img
        src={mozLogo}
        alt="Mozilla"
        className="h-6 w-auto self-start invert"
      />
      <div className="my-10 desktop:my-0">
        <h1 className="text-xxxl desktop:text-[48px] font-bold leading-tight max-w-lg">
          One account. Every Firefox. Your rules.
        </h1>
        <ul className="mt-8 space-y-4 text-lg">
          <li className="flex gap-3">
            <span aria-hidden>🔄</span> Passwords, tabs, and bookmarks on every
            device
          </li>
          <li className="flex gap-3">
            <span aria-hidden>🛡️</span> End-to-end encrypted. We cannot read
            your data.
          </li>
          <li className="flex gap-3">
            <span aria-hidden>✨</span> More privacy products from Mozilla
          </li>
        </ul>
      </div>
      <SyncCloudsImage className="hidden desktop:block w-72 opacity-90" />
    </section>
    <section className="desktop:w-2/5 bg-white flex items-center justify-center p-8">
      <form className="w-full max-w-sm" onSubmit={(e) => e.preventDefault()}>
        <h2 className="text-xxl font-bold text-grey-700">Get started</h2>
        <p className="mt-1 text-sm text-grey-500">
          New or returning, it starts with your email.
        </p>
        <label className="block mt-8 text-sm font-semibold text-grey-600">
          Email
          <input
            type="email"
            placeholder="you@example.com"
            className="mt-2 w-full rounded-lg border border-grey-200 px-4 py-3 text-base font-normal focus:outline-none focus:border-blue-500"
          />
        </label>
        <button type="submit" className="cta-primary cta-xl w-full mt-5">
          Continue
        </button>
        <div className="flex items-center gap-3 my-6 text-xs text-grey-400">
          <hr className="flex-1 border-grey-100" /> or{' '}
          <hr className="flex-1 border-grey-100" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {providers.map(({ Icon, name }) => (
            <button
              key={name}
              type="button"
              className="flex flex-col items-center gap-1 rounded-lg border border-grey-200 py-3 text-xs text-grey-600"
            >
              <span aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              {name}
            </button>
          ))}
        </div>
        <Terms className="mt-8" />
      </form>
    </section>
  </div>
);

/** 2. Minimal conversational: one huge question, the field is the headline. */
export const Conversational = () => (
  <div className="min-h-screen bg-grey-10 flex flex-col px-6 desktop:px-24 py-10">
    <img src={mozLogo} alt="Mozilla" className="h-5 w-auto self-start" />
    <form
      className="flex-1 flex flex-col justify-center max-w-4xl"
      onSubmit={(e) => e.preventDefault()}
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
        Hi there 👋
      </p>
      <label
        htmlFor="proto-email"
        className="mt-3 text-xxxl desktop:text-[64px] font-bold text-grey-700"
      >
        What’s your email?
      </label>
      <div className="mt-10 flex items-center border-b-4 border-grey-700 focus-within:border-violet-600">
        <input
          id="proto-email"
          type="email"
          placeholder="type it here"
          className="flex-1 min-w-0 bg-transparent py-3 text-xxl desktop:text-[40px] text-grey-700 placeholder-grey-400 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Continue"
          className="ms-4 h-14 w-14 shrink-0 rounded-full bg-violet-600 text-xxxl text-white"
        >
          →
        </button>
      </div>
      <p className="mt-4 text-sm text-grey-400">
        We’ll sign you in, or help you make an account. Press Enter to go.
      </p>
      <div className="mt-16 flex items-center gap-4 text-sm text-grey-500">
        <span>Or use</span>
        {providers.map(({ Icon, name }) => (
          <button
            key={name}
            type="button"
            aria-label={name}
            className="h-11 w-11 flex items-center justify-center rounded-full bg-white shadow"
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </form>
    <Terms />
  </div>
);

/** 3. Passkey-first chooser: pick a method, email is one tile among four. */
export const MethodChooser = ({
  initialEmailOpen = false,
}: {
  initialEmailOpen?: boolean;
}) => {
  const [emailOpen, setEmailOpen] = useState(initialEmailOpen);
  const tile =
    'flex items-center gap-4 w-full rounded-2xl border-2 p-5 text-start transition';
  return (
    <div className="min-h-screen bg-grey-700 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <img src={mozLogo} alt="Mozilla" className="h-5 w-auto invert" />
        <h1 className="mt-8 text-xxxl font-bold">
          How do you want to continue?
        </h1>
        <p className="mt-2 text-sm text-grey-200">
          Pick one. You can add more ways to sign in later.
        </p>
        <div className="mt-8 space-y-3">
          <button
            type="button"
            className={`${tile} border-green-400 bg-green-400 text-grey-900`}
          >
            <PasskeyIcon className="h-8 w-8 shrink-0" ariaHidden />
            <span>
              <span className="block font-bold">Use a passkey</span>
              <span className="block text-sm">
                Fastest and safest. No password needed.
              </span>
            </span>
            <span className="ms-auto shrink-0 rounded-full bg-grey-900 px-2 py-1 text-xs text-green-400">
              Recommended
            </span>
          </button>
          <button type="button" className={`${tile} border-grey-500`}>
            <span className="h-8 w-8 flex items-center justify-center rounded-full bg-white">
              <GoogleLogo className="h-5 w-5" />
            </span>
            <span className="font-bold">Continue with Google</span>
          </button>
          <button type="button" className={`${tile} border-grey-500`}>
            <span className="h-8 w-8 flex items-center justify-center rounded-full bg-white">
              <AppleLogo className="h-5 w-5" />
            </span>
            <span className="font-bold">Continue with Apple</span>
          </button>
          <div
            className={`rounded-2xl border-2 ${emailOpen ? 'border-white' : 'border-grey-500'}`}
          >
            <button
              type="button"
              className="flex items-center gap-4 w-full p-5 text-start"
              onClick={() => setEmailOpen(!emailOpen)}
            >
              <span className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-grey-900">
                @
              </span>
              <span className="font-bold">Use email</span>
              <span className="ms-auto">{emailOpen ? '▴' : '▾'}</span>
            </button>
            {emailOpen && (
              <form
                className="flex gap-2 px-5 pb-5"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  aria-label="Email"
                  placeholder="you@example.com"
                  className="flex-1 min-w-0 rounded-lg bg-grey-600 px-4 py-3 text-white placeholder-grey-300 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-white px-4 font-bold text-grey-900"
                >
                  Go
                </button>
              </form>
            )}
          </div>
        </div>
        <Terms className="mt-8 !text-grey-300" />
      </div>
    </div>
  );
};
