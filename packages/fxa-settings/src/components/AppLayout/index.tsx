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
import { LocaleToggle } from '../LocaleToggle';
import { useConfig } from '../../models/hooks';

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
  splitLayout?: boolean;
  /** Whether to show the locale toggle in the footer */
  showLocaleToggle?: boolean;
};

export const AppLayout = ({
  title,
  children,
  widthClass,
  cmsInfo,
  splitLayout = false,
  wrapInCard = true,
}: AppLayoutProps) => {
  const { l10n } = useLocalization();
  const config = useConfig();
  const cmsBackgrounds = cmsInfo?.shared?.backgrounds;
  const cmsPageTitle = cmsInfo?.shared?.pageTitle;
  const cmsHeaderLogoUrl = cmsInfo?.shared?.headerLogoUrl;
  const cmsHeaderLogoAltText = cmsInfo?.shared?.headerLogoAltText;

  const overrideTitle = title ? title : cmsPageTitle;

  const favicon = cmsInfo?.shared?.favicon;

  const showLocaleToggle = config.featureFlags?.showLocaleToggle;

  return (
    <>
      <Head {...{ title: overrideTitle, favicon }} />
      <div
        className={classNames(
          'flex min-h-screen flex-col items-center',
          cmsBackgrounds?.defaultLayout && 'tablet:[background:var(--cms-bg)]',
          splitLayout && 'tablet:relative'
        )}
        style={
          cmsBackgrounds?.defaultLayout
            ? ({
                '--cms-bg': cmsBackgrounds.defaultLayout,
              } as React.CSSProperties)
            : undefined
        }
        data-testid="app"
      >
        <div id="body-top" className="w-full hidden mobileLandscape:block" />
        <header
          className={classNames(
            'w-full px-6 py-4 mobileLandscape:py-6',
            cmsBackgrounds?.header &&
              'tablet:[background:var(--cms-header-bg)]',
            // Absolute position so the background-image can optionally show through.
            splitLayout && 'tablet:absolute'
          )}
          style={
            cmsBackgrounds?.header
              ? ({
                  '--cms-header-bg': cmsBackgrounds.header,
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

        {!splitLayout ? (
          <main className="mobileLandscape:flex mobileLandscape:items-center mobileLandscape:flex-1">
            <section>
              {wrapInCard ? (
                <div className={classNames('card', widthClass)}>{children}</div>
              ) : (
                children
              )}
            </section>
          </main>
        ) : (
          <div className="flex flex-col tablet:flex-row w-full flex-1">
            <div
              className={classNames(
                'hidden tablet:flex flex-1',
                cmsBackgrounds?.splitLayout &&
                  'tablet:[background:var(--cms-split-layout-bg)]'
              )}
              /* Some split layout backgrounds, such as an artsy galaxy fox, should have
              alt text for user delight. Others can be considered purely decorative. If
              alt text is given, include it. */
              {...(cmsBackgrounds?.splitLayoutAltText && {
                role: 'img',
                'aria-label': cmsBackgrounds.splitLayoutAltText,
              })}
              style={
                cmsBackgrounds?.splitLayout
                  ? ({
                      '--cms-split-layout-bg': cmsBackgrounds.splitLayout,
                    } as React.CSSProperties)
                  : undefined
              }
            />
            <main className="mobileLandscape:items-center tablet:flex-1 tablet:bg-white py-8 px-6 tablet:px-10 mobileLandscape:py-9 tablet:ml-auto flex justify-center flex-1">
              <section className="max-w-120">{children}</section>
            </main>
          </div>
        )}
      </div>
      {showLocaleToggle && (
        <footer>
          <div className="fixed bottom-6 left-6 z-10">
            <LocaleToggle />
          </div>
        </footer>
      )}
      <div id="body-bottom" className="w-full block mobileLandscape:hidden" />
    </>
  );
};

export default AppLayout;
