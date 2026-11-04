/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { createContext, useLayoutEffect } from 'react';
import mozLogo from '@fxa/shared/assets/images/moz-logo-bw-rgb.svg';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useLocalization } from '@fluent/react';
import Head from 'fxa-react/components/Head';
import classNames from 'classnames';
import { RelierCmsInfo } from '../../models/integrations';
import { LocaleToggle } from '../LocaleToggle';
import { DarkModeToggle } from '../DarkModeToggle';
import { useConfig } from '../../models/hooks';
import { CardLoadingSpinner } from '../CardLoadingSpinner';

type AppLayoutBaseProps = {
  /**
   * A relying party's page-level CMS title. Takes precedence over
   * `cmsInfo.shared.pageTitle`, which takes precedence over `title`.
   */
  cmsPageTitle?: string;
  children?: React.ReactNode;
  widthClass?: string;
  cmsInfo?: RelierCmsInfo;
  /** Whether the content is wrapped in a card.
   * Set to `false` for content that already provides a card, like
   * `FlowContainer`.
   */
  wrapInCard?: boolean;
  splitLayout?: boolean;
  /** Whether the page behind the card is white rather than the default grey.
   * The mobile pairing screens need this: below `mobileLandscape` the card is
   * transparent, so the page colour is the screen colour.
   */
  whiteBackground?: boolean;
  /** Whether to show the locale toggle in the footer */
  showLocaleToggle?: boolean;
  /** Whether to show a loading spinner instead of children.
   * This preserves the background styling while showing a loading state.
   */
  loading?: boolean;
  /** Callback to update the current split layout state in App component.
   * Used to preserve layout during navigation Suspense fallback.
   */
  setCurrentSplitLayout?: (value: boolean) => void;
};

type AppLayoutProps = AppLayoutBaseProps &
  (
    | { loading: true; title?: string }
    | {
        loading?: boolean;
        /** Localized page title, shown before the product name in the tab. */
        title: string;
      }
  );

/** True inside `AppLayout`, which owns the page title. */
export const AppLayoutContext = createContext(false);

export const AppLayout = ({
  title,
  cmsPageTitle,
  children,
  widthClass,
  cmsInfo,
  splitLayout = false,
  whiteBackground = false,
  wrapInCard = true,
  loading = false,
  setCurrentSplitLayout,
}: AppLayoutProps) => {
  const { l10n } = useLocalization();
  const config = useConfig();

  // Set the current page's layout preference in state so navigation
  // preserves the layout during Suspense fallback, preventing visual flash.
  // Only update if setCurrentSplitLayout is provided (it's omitted from Suspense fallback).
  // Uses useLayoutEffect instead of useEffect to prevent flicker of incorrect layout before paint
  useLayoutEffect(() => {
    if (setCurrentSplitLayout) {
      setCurrentSplitLayout(splitLayout);
    }
  }, [splitLayout, setCurrentSplitLayout]);

  const cmsBackgrounds = cmsInfo?.shared?.backgrounds;
  const cmsHeaderLogoUrl = cmsInfo?.shared?.headerLogoUrl;
  const cmsHeaderLogoAltText = cmsInfo?.shared?.headerLogoAltText;

  const pageTitle = cmsPageTitle || cmsInfo?.shared?.pageTitle || title;

  const favicon = cmsInfo?.shared?.favicon;

  const showLocaleToggle = config.featureFlags?.showLocaleToggle;
  const showDarkModeToggle = config.darkMode?.enabled;

  // The mobile pairing screens carry their own Firefox lockup instead of the
  // Mozilla logo header, and their loading states match.
  const isMobilePairingScreen =
    window.location.pathname?.startsWith('/pair/supplicant') ?? false;

  // Pairing pages are for mobile, so they offer no locale or theme choice.
  const pathname = window.location.pathname;
  const showFooter = pathname !== '/pair' && !pathname?.startsWith('/pair/');

  return (
    <AppLayoutContext.Provider value={true}>
      <Head {...{ title: pageTitle, favicon }} />
      <div
        className={classNames(
          'flex min-h-screen flex-col items-center dark:bg-grey-900',
          whiteBackground && 'bg-white',
          // Transparent so the body background (bg-canvas) shows through; CMS backgrounds set their own.
          !whiteBackground &&
            !cmsBackgrounds?.defaultLayout &&
            'nova:bg-transparent',
          cmsBackgrounds?.defaultLayout &&
            'mobileLandscape:[background:var(--cms-bg)]',
          splitLayout && 'mobileLandscape:relative'
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
        {!isMobilePairingScreen && (
          <header
            className={classNames(
              'w-full px-6 py-4 mobileLandscape:py-6',
              cmsBackgrounds?.header &&
                'mobileLandscape:[background:var(--cms-header-bg)]',
              // Absolute position so the background-image can optionally show through.
              splitLayout && !cmsBackgrounds?.header && 'desktop:absolute'
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
                  className="h-auto w-[140px] mx-0 dark:invert"
                />
              )}
            </LinkExternal>
          </header>
        )}

        {!splitLayout ? (
          <>
            {/* The mobile card is full-bleed, so these span the viewport below
                `mobileLandscape` — left to shrink-to-fit, a card with narrow
                content ends up narrower than the screen. Above that breakpoint
                shrink-to-fit is what centers the fixed-width card. */}
            <main className="flex w-full mobileLandscape:w-auto mobileLandscape:items-center flex-1">
              <section className="w-full mobileLandscape:w-auto">
                {loading ? (
                  <>
                    <CardLoadingSpinner />
                  </>
                ) : wrapInCard ? (
                  <>
                    <div
                      className={classNames(
                        'card mobileLandscape:my-4',
                        widthClass
                      )}
                    >
                      {children}
                    </div>
                  </>
                ) : (
                  children
                )}
              </section>
            </main>
            {showFooter && (showLocaleToggle || showDarkModeToggle) && (
              <footer className="w-full py-2 px-4 mobileLandscape:mx-8 mobileLandscape:pb-4 flex text-grey-400 dark:text-grey-300 nova:text-deemphasized">
                {showLocaleToggle && (
                  <div className="w-full mobileLandscape:w-auto flex items-center mobileLandscape:ms-10">
                    <LocaleToggle />
                  </div>
                )}
                {showDarkModeToggle && (
                  <div className="w-full mobileLandscape:w-auto flex items-center mobileLandscape:ms-10">
                    <DarkModeToggle />
                  </div>
                )}
              </footer>
            )}
          </>
        ) : (
          <div className="flex flex-col desktop:flex-row w-full flex-1">
            <div
              className={classNames(
                'hidden desktop:flex flex-1',
                cmsBackgrounds?.splitLayout &&
                  'desktop:[background:var(--cms-split-layout-bg)]'
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
            <div className="mobileLandscape:items-center desktop:bg-white desktop:nova:bg-box desktop:ml-auto flex flex-col flex-1">
              <main className="flex justify-center mobileLandscape:items-center flex-1">
                {loading ? (
                  <section>
                    <CardLoadingSpinner />
                  </section>
                ) : (
                  <section className="card mobileLandscape:my-4">
                    {children}
                  </section>
                )}
              </main>
              {showFooter && (
                <footer className="w-full py-2 px-6 tablet:px-10 flex text-grey-400 dark:text-grey-300 nova:text-deemphasized">
                  {showLocaleToggle && (
                    <div className="w-full mobileLandscape:w-auto flex items-center">
                      <LocaleToggle />
                    </div>
                  )}
                  {showDarkModeToggle && (
                    <div className="w-full mobileLandscape:w-auto flex items-center mobileLandscape:ms-10">
                      <DarkModeToggle />
                    </div>
                  )}
                </footer>
              )}
            </div>
          </div>
        )}
      </div>
      <div id="body-bottom" className="w-full block mobileLandscape:hidden" />
    </AppLayoutContext.Provider>
  );
};

export default AppLayout;
