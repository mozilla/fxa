/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { BannerProps } from './interfaces';
import {
  CheckmarkCircleOutlineCurrentIcon,
  CloseIcon,
  InformationOutlineCurrentIcon as InfoIcon,
  AlertOutlineCurrentIcon as WarningIcon,
  ErrorOutlineCurrentIcon as ErrorIcon,
} from '../Icons';
import classNames from 'classnames';
import { useFtlMsgResolver } from '../../models';
import { FIREFOX_NOREPLY_EMAIL } from '../../constants';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { Link } from '@reach/router';

export const Banner = ({
  type,
  content,
  animation,
  dismissButton,
  link,
}: BannerProps) => {
  return (
    <div
      className={classNames(
        'my-4 flex flex-row no-wrap items-center px-4 py-3 gap-3.5 rounded-md border border-transparent text-start text-sm',
        type === 'error' && 'bg-red-100',
        type === 'info' && 'bg-blue-50',
        type === 'success' && 'bg-green-200',
        type === 'warning' && 'bg-orange-50',
        animation?.animate && animation?.className
      )}
      role="status"
      onAnimationEnd={animation?.handleAnimationEnd}
    >
      {/* Icon fills use 'currentColor' (from text color) for better accessibility in HCM mode */}
      {type === 'error' && <ErrorIcon className="shrink-0" />}
      {type === 'info' && <InfoIcon className="shrink-0" />}
      {type === 'success' && (
        <CheckmarkCircleOutlineCurrentIcon
          className="shrink-0"
          mode="success"
        />
      )}
      {type === 'warning' && <WarningIcon className="shrink-0" />}

      <div className="flex flex-col grow ">
        {content.localizedHeading && (
          <p className="font-bold">{content.localizedHeading}</p>
        )}
        {content.localizedDescription && <p>{content.localizedDescription}</p>}
        {/* Link is optional and can be either an external or internal link */}
        {/* Link color here was tweaked for accessibility - this colour passes AAA for all banner background colors */}
        {link && link.url && (
          <span className="grow-0">
            <LinkExternal
              className="text-sm link-blue"
              href={link.url}
              {...(link.gleanId && { 'data-glean-id': link.gleanId })}
            >
              {link.localizedText}
            </LinkExternal>
          </span>
        )}
        {link && link.path && (
          <span>
            <Link
              className="text-sm link-blue"
              to={link.path}
              {...(link.gleanId && { 'data-glean-id': link.gleanId })}
            >
              {link.localizedText}
            </Link>
          </span>
        )}
      </div>
      {dismissButton && (
        <button
          aria-label={`Close banner`}
          className={classNames(
            'shrink-0 self-start hover:backdrop-saturate-150 focus:backdrop-saturate-200',
            type === 'error' && 'hover:bg-red-200 focus:bg-red-300',
            type === 'info' && 'hover:bg-blue-100 focus:bg-blue-200',
            type === 'success' && 'hover:bg-green-400 focus:bg-green-500',
            type === 'warning' && 'hover:bg-orange-100 focus:bg-orange-200'
          )}
          type="button"
          onClick={dismissButton.action}
          {...(dismissButton.gleanId && {
            'data-glean-id': dismissButton.gleanId,
          })}
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export const ResendCodeSuccessBanner = ({
  animation,
}: Partial<BannerProps>) => {
  const ftlMsgResolver = useFtlMsgResolver();

  const content = {
    localizedHeading: ftlMsgResolver.getMsg(
      'resend-code-success-heading',
      'A new code was sent to your email.'
    ),
    localizedDescription: ftlMsgResolver.getMsg(
      'resend-success-banner-description',
      `Add ${FIREFOX_NOREPLY_EMAIL} to your contacts to ensure a smooth delivery.`,
      { accountsEmail: FIREFOX_NOREPLY_EMAIL }
    ),
  };

  return <Banner type="success" {...{ animation, content }} />;
};

export const ResendLinkSuccessBanner = ({
  animation,
}: Partial<BannerProps>) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const content = {
    localizedHeading: ftlMsgResolver.getMsg(
      'resend-link-success-banner-heading',
      'A new link was sent to your email.'
    ),
    localizedDescription: ftlMsgResolver.getMsg(
      'resend-success-banner-description',
      `Add ${FIREFOX_NOREPLY_EMAIL} to your contacts to ensure smooth delivery.`,
      { accountsEmail: FIREFOX_NOREPLY_EMAIL }
    ),
  };

  return <Banner type="success" {...{ animation, content }} />;
};

export default Banner;
