/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import { RemoteMetadata } from '../../../lib/types';

import AppLayout from '../../../components/AppLayout';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';
import { FtlMsg } from '../../../../../fxa-react/lib/utils';
import Banner, { BannerType } from '../../../components/Banner';

// Reuse these images temporarily
import monitorIcon from '../../../components/Settings/BentoMenu/monitor.svg';
import relayIcon from '../../../components/Settings/BentoMenu/relay.svg';
import vpnIcon from '../../../components/Settings/BentoMenu/vpn-logo.svg';
import checkmarkIcon from './greencheck.svg';
import { LinkExternal } from 'fxa-react/components/LinkExternal';

export type SigninPushCodeConfirmProps = {
  authDeviceInfo: RemoteMetadata;
  handleSubmit: () => void;
  sessionVerified: boolean;
  isLoading: boolean;
  errorMessage?: string;
};

const ProductPromotion = () => {
  const products = [
    {
      icon: monitorIcon,
      title: 'Mozilla Monitor',
      description:
        'Get notified if your information is involved in a data breach.',
      link: 'https://monitor.firefox.com/',
    },
    {
      icon: relayIcon,
      title: 'Firefox Relay',
      description:
        'Keep your email address safe from spam and unwanted emails.',
      link: 'https://relay.firefox.com/',
    },
    {
      icon: vpnIcon,
      title: 'Mozilla VPN',
      description:
        'Protect your internet connection and browse privately with Mozilla VPN.',
      link: 'https://vpn.mozilla.org/',
    },
  ];

  // Note this isn't localized yet since the UX will most likely change
  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-6">
        Explore products from Mozilla that protect your privacy
      </h2>
      {products.map((product, index) => (
        <div
          key={index}
          className="flex items-center justify-center my-6 space-x-4"
        >
          <img
            src={product.icon}
            alt={`${product.title} Logo`}
            className="w-12 h-12"
          />
          <div className="text-left max-w-xs">
            <h3 className="text-md font-semibold mb-1">{product.title}</h3>
            <p className="text-sm leading-relaxed">
              {product.description}
              <LinkExternal
                href={product.link}
                className="text-blue-500 underline"
              >
                {' '}
                Learn more
              </LinkExternal>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const LoginApprovedMessage = () => {
  return (
    <div className="text-center mt-4">
      <img
        src={checkmarkIcon}
        className="w-12 h-12 mx-auto mb-4"
        alt="Checkmark Icon"
      />
      <FtlMsg id="signin-push-code-confirm-login-approved">
        <p className="my-5 text-sm">
          Your login has been approved. Please close this window.
        </p>
      </FtlMsg>
      <ProductPromotion />
    </div>
  );
};

const SigninPushCodeConfirm = ({
  authDeviceInfo,
  handleSubmit,
  sessionVerified,
  isLoading,
  errorMessage,
}: SigninPushCodeConfirmProps & RouteComponentProps) => {
  return (
    <AppLayout>
      {sessionVerified ? (
        <LoginApprovedMessage />
      ) : (
        <>
          <FtlMsg id="signin-push-code-confirm-instruction">
            <h1 className="card-header">Confirm your login</h1>
          </FtlMsg>

          {errorMessage && (
            <Banner type={BannerType.error}>{errorMessage || ''}</Banner>
          )}

          <FtlMsg id="signin-push-code-confirm-description">
            <p className="my-5 text-sm">
              We detected a login attempt from the following device. If this was
              you, please approve the login.
            </p>
          </FtlMsg>

          <DeviceInfoBlock remoteMetadata={authDeviceInfo} />
          <div className="flex flex-col justify-center mt-6">
            <button
              id="signin-push-code-confirm-login-button"
              className="cta-primary cta-xl w-full"
              onClick={handleSubmit}
            >
              {isLoading ? (
                <FtlMsg id="signin-push-code-confirm-verifying">
                  Verifying
                </FtlMsg>
              ) : (
                <FtlMsg id="signin-push-code-confirm-login">
                  Confirm login
                </FtlMsg>
              )}
            </button>

            <FtlMsg id="signin-push-code-confirm-wasnt-me">
              <Link
                to="/settings/change_password"
                className="link-grey mt-4 text-sm"
              >
                This wasn’t me, change password.
              </Link>
            </FtlMsg>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default SigninPushCodeConfirm;
