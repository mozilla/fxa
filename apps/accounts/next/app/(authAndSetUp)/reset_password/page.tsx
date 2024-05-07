/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Link from 'next/link';

export default function Index() {
  return (
    <>
      <h1 className="font-header">Reset password</h1>
      <Link href="/" className="link-blue">
        Home
      </Link>
    </>
  );
}
