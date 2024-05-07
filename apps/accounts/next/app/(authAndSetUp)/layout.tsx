/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import '../styles/tailwind.css';
import Image from 'next/image';
import mozLogo from 'libs/shared/assets/src/images/moz-logo-bw-rgb.svg';

export const metadata = {
  title: 'Mozilla accounts', // TODO: Localize this or remove
  description: '', // TODO: Add or remove, is currently an empty string
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="TODO">
      <body>
        <div className="flex min-h-screen flex-col items-center">
          <header className="w-full px-6 pt-16 pb-0 mobileLandscape:py-6">
            {/* TODO, transfer/create new LinkExternal */}
            <a
              rel="author"
              href="https://www.mozilla.org/about/?utm_source=firefox-accounts&amp;utm_medium=Referral"
              className="mobileLandscape:inline-block"
              target="_blank"
            >
              {/* TODO, alt text l10n */}
              <Image
                src={mozLogo}
                alt="Mozilla logo"
                className="h-auto w-28 mx-auto mobileLandscape:mx-0"
              />
            </a>
          </header>
          <main className="mobileLandscape:flex mobileLandscape:items-center mobileLandscape:flex-1">
            <section>
              {/* TODO, 'width' class from fxa-settings layout equivalent */}
              <div className="card">{children}</div>
            </section>
          </main>
        </div>
      </body>
    </html>
  );
}
