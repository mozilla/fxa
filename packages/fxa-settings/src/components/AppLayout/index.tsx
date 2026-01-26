/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useLayoutEffect } from 'react';
import mozLogo from '@fxa/shared/assets/images/moz-logo-bw-rgb.svg';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useLocalization } from '@fluent/react';
import Head from 'fxa-react/components/Head';
import classNames from 'classnames';
import { RelierCmsInfo } from '../../models/integrations';
import { LocaleToggle } from '../LocaleToggle';
import { useConfig } from '../../models/hooks';
import { CardLoadingSpinner } from '../CardLoadingSpinner';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

type AppLayoutProps = {
  // TODO: FXA-6803 - the title prop should be made mandatory
  // the string should be localized
  /**
   * `title` takes precedence over the `cmsInfo.shared.pageTitle` if both are present.
   */
  title?: string;
  children?: React.ReactNode;
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
  /** Whether to show a loading spinner instead of children.
   * This preserves the background styling while showing a loading state.
   */
  loading?: boolean;
  /** Callback to update the current split layout state in App component.
   * Used to preserve layout during navigation Suspense fallback.
   */
  setCurrentSplitLayout?: (value: boolean) => void;
};

export const AppLayout = ({
  title,
  children,
  widthClass,
  cmsInfo,
  splitLayout = false,
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
          <>
            <main className="flex mobileLandscape:items-center flex-1">
              <section>
                {loading ? (
                  <>
                    <CardLoadingSpinner />
                  </>
                ) : wrapInCard ? (
                  <>
                    <div className={classNames('card', widthClass)}>
                      {children}
                    </div>
                  </>
                ) : (
                  children
                )}
              </section>
            </main>
            {showLocaleToggle && (
              <footer className="w-full py-2 px-4 mobileLandscape:mx-8 mobileLandscape:pb-4 flex text-grey-400">
                <div className="w-full mobileLandscape:w-auto flex items-center mobileLandscape:ms-10">
                  <LocaleToggle />
                </div>
              </footer>
            )}
          </>
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
            <div className="mobileLandscape:items-center tablet:flex-1 tablet:bg-white tablet:ml-auto flex flex-col flex-1">
              <main className="flex justify-center items-center flex-1">
                <section className="max-w-120 desktop:w-120 px-8 py-8">
                  {loading ? (
                    <LoadingSpinner className="h-full flex items-center" />
                  ) : (
                    children
                  )}
                </section>
              </main>
              {showLocaleToggle && (
                <footer className="w-full py-2 px-6 tablet:px-10 flex text-grey-400">
                  <div className="w-full mobileLandscape:w-auto flex items-center">
                    <LocaleToggle />
                  </div>
                </footer>
              )}
            </div>
          </div>
        )}
      </div>
      <div id="body-bottom" className="w-full block mobileLandscape:hidden" />
    </>
  );
};

export default AppLayout;
