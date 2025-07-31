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
  title?: string;
  children: React.ReactNode;
  widthClass?: string;
  integration?: { getCmsInfo?: () => RelierCmsInfo | undefined };
  /** Whether the content is wrapped in a card.
   * Set to `false` for content that already provides a card, like
   * `FlowContainer`.
   */
  wrapInCard?: boolean;
};

export const AppLayout = ({
  title,
  children,
  widthClass,
  integration,
  wrapInCard = true,
}: AppLayoutProps) => {
  const { l10n } = useLocalization();
  const cmsInfo = integration?.getCmsInfo?.();
  const cmsBackgroundColor = cmsInfo?.shared?.backgroundColor;
  const cmsPageTitle = cmsInfo?.shared?.pageTitle;
  const cmsHeaderLogoUrl = cmsInfo?.shared?.headerLogoUrl;
  const cmsHeaderLogoAltText = cmsInfo?.shared?.headerLogoAltText;

  const overrideTitle = cmsPageTitle ? cmsPageTitle : title;

  // Only apply background image if cmsBackgroundColor is a valid background-image CSS value
  const hasValidBackgroundImage =
    cmsBackgroundColor &&
    (cmsBackgroundColor.includes('linear-gradient') ||
      cmsBackgroundColor.includes('radial-gradient'));

  return (
    <>
      <Head {...{ title: overrideTitle }} />
      <div
        className="flex min-h-screen flex-col items-center"
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
        <header className="w-full px-6 pt-16 pb-0 mobileLandscape:py-6">
          <LinkExternal
            rel="author"
            href="https://www.mozilla.org/about/?utm_source=firefox-accounts&amp;utm_medium=Referral"
            className="mobileLandscape:inline-block"
          >
            {cmsHeaderLogoUrl ? (
              <img
                src={cmsHeaderLogoUrl}
                alt={cmsHeaderLogoAltText || 'logo'}
                className="h-auto w-[140px] mx-auto mobileLandscape:mx-0"
              />
            ) : (
              <img
                src={mozLogo}
                alt={l10n.getString(
                  'app-footer-mozilla-logo-label',
                  null,
                  'Mozilla logo'
                )}
                className="h-auto w-[140px] mx-auto mobileLandscape:mx-0"
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
