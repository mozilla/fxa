/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import LinkExternal from 'fxa-react/components/LinkExternal';

const Header = () => {
  return (
    <div className="bg-grey-50 flex items-center justify-between sticky z-20 top-0 py-4 pb-3 border-b border-grey-400/25 px-2 -mt-4 -ml-12 -mr-12">
      <div className="flex items-center gap-2">
        <img
          className="h-12"
          src="assets/moz-m-logo.svg"
          alt="firefox account logo"
        />
        <h1 className="text-xl font-bold text-grey-900">Design Guide</h1>
      </div>
      <div>
        <LinkExternal
          href="https://github.com/mozilla/fxa"
          className="opacity-75 hover:opacity-100 focus:opacity-100"
        >
          <img src="assets/github-icon.svg" className="w-8 h-8" alt="github" />
        </LinkExternal>
      </div>
    </div>
  );
};

export default Header;
