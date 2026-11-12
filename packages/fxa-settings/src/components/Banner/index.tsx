/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect, useState } from 'react';
import { BannerProps } from './interfaces';
import {
  CheckmarkCircleOutlineCurrentIcon,
  CloseIcon,
  InformationOutlineCurrentIcon as InfoIcon,
  AlertOutlineCurrentIcon as WarningIcon,
  ErrorOutlineCurrentIcon as ErrorIcon,
  InformationOutlineBlueIcon,
} from '../Icons';
import classNames from 'classnames';
import { useFtlMsgResolver } from '../../models';
import { FIREFOX_NOREPLY_EMAIL } from '../../constants';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { Link } from 'react-router';
import GleanMetrics from '../../lib/glean';

export const Banner = ({
  type,
  content,
  customContent,
  animation,
  dismissButton,
  link,
  isFancy,
  bannerId,
  className,
  gleanId,
  textAlignClassName = 'text-start',
  iconAlignClassName = 'self-center',
}: BannerProps) => {
  // Mount the live region empty, then add its content, so screen readers announce the change
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (!gleanId) return;
    try {
      GleanMetrics.banner.view({ event: { reason: gleanId } });
    } catch {
      // A metrics failure must never block the banner.
    }
  }, [gleanId]);

  const iconClassName = `shrink-0 ${iconAlignClassName} nova:absolute nova:top-3 nova:start-3`;
  return (
    <div
      id={bannerId || ''}
      className={
        ready
          ? classNames(
              'my-4 flex flex-row no-wrap items-center px-4 py-3 gap-3.5 rounded-md border border-transparent text-sm text-grey-700 nova:text-default',
              // Nova message bar: neutral body, status tint on a start-edge icon strip.
              'nova:relative nova:overflow-hidden nova:items-start nova:justify-start nova:text-start nova:gap-3 nova:p-3 nova:ps-16 nova:rounded-xl nova:border-deemphasized nova:bg-box nova:bg-none',
              'nova:before:absolute nova:before:inset-y-0 nova:before:start-0 nova:before:w-12',
              className,
              textAlignClassName,
              textAlignClassName === 'text-center' && 'justify-center',
              type === 'error' && 'bg-critical',
              type === 'info' && !isFancy && 'bg-information',
              type === 'info' &&
                isFancy &&
                'bg-gradient-to-tr from-blue-600/10 to-purple-500/10',
              type === 'success' && 'bg-success',
              type === 'warning' && 'bg-warning',
              type === 'error' && 'nova:before:bg-critical',
              type === 'info' && 'nova:before:bg-information',
              type === 'success' && 'nova:before:bg-success',
              type === 'warning' && 'nova:before:bg-warning',
              animation?.animate && animation?.className
            )
          : undefined
      }
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      onAnimationEnd={ready ? animation?.handleAnimationEnd : undefined}
      tabIndex={-1}
    >
      {ready && (
        <>
          {/* Icon fills use 'currentColor' (from text color) for better accessibility in HCM mode */}
          {type === 'error' && (
            <ErrorIcon
              className={`${iconClassName} nova:text-icon-critical`}
              aria-hidden
            />
          )}
          {type === 'info' && (
            <InfoIcon
              className={`${iconClassName} nova:text-icon-information ${isFancy ? 'hidden nova:block' : ''}`}
              aria-hidden
            />
          )}
          {/* Its blue is baked into the SVG, so Nova swaps in the currentColor icon above. */}
          {type === 'info' && isFancy && (
            <InformationOutlineBlueIcon
              className={`${iconClassName} nova:hidden`}
              aria-hidden
            />
          )}
          {type === 'success' && (
            <CheckmarkCircleOutlineCurrentIcon
              className={`${iconClassName} nova:text-icon-success`}
              mode="success"
              ariaHidden
            />
          )}
          {type === 'warning' && (
            <WarningIcon
              className={`${iconClassName} nova:text-icon-warning`}
              mode="attention"
              ariaHidden
            />
          )}

          <div
            className={classNames(
              'flex flex-col nova:grow',
              textAlignClassName === 'text-start' && 'grow'
            )}
          >
            {content?.localizedHeading && (
              <p className="font-heading">{content.localizedHeading}</p>
            )}
            {content?.localizedDescription && (
              <p>{content.localizedDescription}</p>
            )}
            {/* Link is optional and can be either an external or internal link */}
            {/* Link color here was tweaked for accessibility - this colour passes AAA for all banner background colors */}
            {link && link.url && (
              <span className="grow-0">
                <LinkExternal
                  className="text-sm link-blue"
                  href={link.url}
                  {...(link.gleanId && {
                    gleanDataAttrs: { id: link.gleanId },
                  })}
                  onClick={link.onClick}
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
                  {...(link.locationState && { state: link.locationState })}
                >
                  {link.localizedText}
                </Link>
              </span>
            )}

            {customContent && <>{customContent}</>}
          </div>
          {dismissButton && (
            <button
              aria-label={`Close banner`}
              className={classNames(
                'shrink-0 self-start hover:backdrop-saturate-150 focus:backdrop-saturate-200 focus-visible-default rounded',
                type === 'error' && 'hover:bg-red-200 focus:bg-red-300',
                type === 'info' &&
                  !isFancy &&
                  'hover:bg-blue-100 focus:bg-blue-200',
                type === 'info' &&
                  isFancy &&
                  'hover:bg-gradient-to-tr hover:from-blue-700/10 hover:to-purple-600/10 focus:bg-gradient-to-tr focus:from-blue-800/10 focus:to-purple-700/10',
                type === 'success' && 'hover:bg-green-400 focus:bg-green-500',
                type === 'warning' && 'hover:bg-orange-100 focus:bg-orange-200',
                'nova:hover:bg-button-hover nova:hover:bg-none nova:focus:bg-button-hover nova:focus:bg-none'
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
        </>
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
      'resend-code-success-banner-heading',
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
