/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import mozLogo from '@fxa/shared/assets/images/moz-logo-bw-rgb.svg';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useLocalization } from '@fluent/react';
import Head from 'fxa-react/components/Head';
import classNames from 'classnames';
import { RelierCmsInfo } from '../../models/integrations';

type AppLayoutProps = {
  // TODO: FXA-6803 - the title prop should be made mandatory
  // the string should be localized
  /**
   * `title` takes precedence over the `cmsInfo.shared.pageTitle` if both are present.
   */
  title?: string;
  children: React.ReactNode;
  widthClass?: string;
  cmsInfo?: RelierCmsInfo;
  /** Whether the content is wrapped in a card.
   * Set to `false` for content that already provides a card, like
   * `FlowContainer`.
   */
  wrapInCard?: boolean;
};

const looseValidBgCheck = (value: string | undefined) => {
  return (
    value &&
    (value.includes('linear-gradient') ||
      value.includes('radial-gradient') ||
      value.includes('rgb') ||
      value.includes('#'))
  );
};

export const AppLayout = ({
  title,
  children,
  widthClass,
  cmsInfo,
  wrapInCard = true,
}: AppLayoutProps) => {
  const { l10n } = useLocalization();
  const cmsBackgroundColor = cmsInfo?.shared?.backgroundColor;
  const cmsHeaderBackground = cmsInfo?.shared?.headerBackground;
  const cmsPageTitle = cmsInfo?.shared?.pageTitle;
  const cmsHeaderLogoUrl = cmsInfo?.shared?.headerLogoUrl;
  const cmsHeaderLogoAltText = cmsInfo?.shared?.headerLogoAltText;

  const overrideTitle = title ? title : cmsPageTitle;

  const hasValidBackgroundImage = looseValidBgCheck(cmsBackgroundColor);
  const hasValidHeaderBackground = looseValidBgCheck(cmsHeaderBackground);

  const favicon = cmsInfo?.shared?.favicon;

  return (
    <>
      <Head {...{ title: overrideTitle, favicon }} />
      <div
        className={classNames(
          'flex min-h-screen flex-col items-center',
          hasValidBackgroundImage && 'tablet:[background:var(--cms-bg)]'
        )}
        style={
          hasValidBackgroundImage
            ? ({
                '--cms-bg': cmsBackgroundColor,
              } as React.CSSProperties)
            : undefined
        }
        data-testid="app"
      >
        <div id="body-top" className="w-full hidden mobileLandscape:block" />
        <header
          className={classNames(
            'w-full px-6 py-4 mobileLandscape:py-6',
            // TODO: default to white if cms background is an image, do in FXA-12188
            hasValidHeaderBackground &&
              'tablet:[background:var(--cms-header-bg)]'
          )}
          style={
            hasValidHeaderBackground
              ? ({
                  '--cms-header-bg': cmsHeaderBackground,
                } as React.CSSProperties)
              : undefined
          }
        >
          <LinkExternal
            rel="author"
            href="https://www.mozilla.org/about/?utm_source=firefox-accounts&amp;utm_medium=Referral"
            className="mobileLandscape:inline-block"
          >
            {cmsHeaderLogoUrl ? (
              <img
                src={cmsHeaderLogoUrl}
                alt={cmsHeaderLogoAltText || 'logo'}
                className="h-auto w-[140px] mx-0"
              />
            ) : (
              <img
                src={mozLogo}
                alt={l10n.getString(
                  'app-footer-mozilla-logo-label',
                  null,
                  'Mozilla logo'
                )}
                className="h-auto w-[140px] mx-0"
              />
            )}
          </LinkExternal>
        </header>
        <main className="mobileLandscape:flex mobileLandscape:items-center mobileLandscape:flex-1">
          <section>
            {wrapInCard ? (
              <div className={classNames('card', widthClass)}>{children}</div>
            ) : (
              children
            )}
          </section>
        </main>
      </div>
      <div id="body-bottom" className="w-full block mobileLandscape:hidden" />
    </>
  );
};

export default AppLayout;
