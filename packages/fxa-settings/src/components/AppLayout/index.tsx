/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import mozLogo from 'fxa-react/images/moz-logo-bw-rgb.svg';
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
};

export const AppLayout = ({ title, children, widthClass }: AppLayoutProps) => {
  const { l10n } = useLocalization();
  return (
    <>
      <Head {...{ title }} />
      <div
        className="flex min-h-screen flex-col items-center"
        data-testid="app"
      >
        <main className="mobileLandscape:flex mobileLandscape:items-center mobileLandscape:flex-1 pt-14">
          <section>
            <div className={classNames('card', widthClass)}>{children}</div>
          </section>
        </main>

        <footer className="hidden mobileLandscape:block w-full p-8">
          <LinkExternal
            rel="author"
            href="https://www.mozilla.org/about/?utm_source=firefox-accounts&amp;utm_medium=Referral"
          >
            <img
              src={mozLogo}
              alt={l10n.getString(
                'app-footer-mozilla-logo-label',
                null,
                'Mozilla logo'
              )}
              className="w-32"
            />
          </LinkExternal>
        </footer>
      </div>
    </>
  );
};

export default AppLayout;
