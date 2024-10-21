/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Image from 'next/image';
import mozillaLogo from '@fxa/shared/assets/images/moz-logo-bw-rgb.svg';
import './styles/global.css';

// TODO - Replace these placeholders as part of FXA-8227
export const metadata = {
  title: 'Mozilla accounts',
  description: 'Mozilla accounts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header
          className="bg-white fixed flex justify-between items-center shadow h-16 left-0 top-0 mx-auto my-0 px-4 py-0 w-full z-40 tablet:h-20"
          role="banner"
          data-testid="header"
        >
          <Image
            src={mozillaLogo}
            alt="Mozilla logo"
            className="object-contain"
            data-testid="branding"
            width={120}
          />
        </header>
        <main className="mt-16 min-h-[calc(100vh_-_4rem)]">{children}</main>
      </body>
    </html>
  );
}
