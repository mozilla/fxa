/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import mozLogo from '@fxa/shared/assets/images/moz-logo-bw-rgb.svg';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useLocalization } from '@fluent/react';
import Head from 'fxa-react/components/Head';
import classNames from 'classnames';

type AppLayoutProps = {
  // TODO: FXA-6803 - the title prop should be made mandatory
  // the string should be localized
  title?: string;
  children: React.ReactNode;
  widthClass?: string;
  cardClass?: string;
};

export const AppLayout = ({
  title,
  children,
  widthClass,
  cardClass = 'card',
}: AppLayoutProps) => {
  const { l10n } = useLocalization();

  return (
    <>
      <Head {...{ title }} />
      <div
        className="flex min-h-screen flex-col items-center"
        data-testid="app"
      >
        <div id="body-top" className="w-full hidden mobileLandscape:block" />
        <header className="w-full px-6 pt-16 pb-0 mobileLandscape:py-6">
          <LinkExternal
            rel="author"
            href="https://www.mozilla.org/about/?utm_source=firefox-accounts&amp;utm_medium=Referral"
            className="mobileLandscape:inline-block"
          >
            <img
              src={mozLogo}
              alt={l10n.getString(
                'app-footer-mozilla-logo-label',
                null,
                'Mozilla logo'
              )}
              className="h-auto w-28 mx-auto mobileLandscape:mx-0"
            />
          </LinkExternal>
        </header>
        <main className="mobileLandscape:flex mobileLandscape:items-center mobileLandscape:flex-1">
          <section>
            <div className={classNames(cardClass, widthClass)}>{children}</div>
          </section>
        </main>
      </div>
      <div id="body-bottom" className="w-full block mobileLandscape:hidden" />
    </>
  );
};

export default AppLayout;
