/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Link from 'next/link';

export default function Index() {
  return (
    <>
      {/* TODO: Tailwind classes from fxa-react config are not working */}
      <h1 className="font-header">Hello accounts NextJS! </h1>
      <button className="cta-primary">Primary CTA</button>

      <Link href="/reset_password" className="link-blue block mt-4">
        /reset_password
      </Link>
      <Link href="/settings" className="link-blue block">
        /settings
      </Link>
    </>
  );
}
