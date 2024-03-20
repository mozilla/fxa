/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized, useLocalization } from '@fluent/react';
import React from 'react';
import LinkExternal from '../LinkExternal';
import mozLogo from '../../../../libs/shared/assets/src/images/moz-logo-bw-rgb.svg';

export const Footer = () => {
  const { l10n } = useLocalization();
  return (
    <footer
      className="py-4 mt-16 mx-4 flex-wrap mobileLandscape:flex-nowrap mobileLandscape:mx-8 mobileLandscape:pb-6 flex border-t border-grey-100 text-grey-400"
      data-testid="footer"
    >
      <LinkExternal
        href="https://www.mozilla.org/about/?utm_source=firefox-accounts&utm_medium=Referral"
        data-testid="link-mozilla"
      >
        <img
          src={mozLogo}
          alt={l10n.getString(
            'app-footer-mozilla-logo-label',
            null,
            'Mozilla logo'
          )}
          className="transition-standard w-18 h-auto opacity-75 hover:opacity-100"
        />
      </LinkExternal>
      <div className="w-full mobileLandscape:w-auto flex items-center mt-3 mobileLandscape:mt-0 mobileLandscape:ml-10">
        <Localized id="app-footer-privacy-notice">
          <LinkExternal
            data-testid="link-privacy"
            href="https://www.mozilla.org/privacy/websites/"
            className="transition-standard text-xs hover:text-grey-500 hover:underline mobileLandscape:self-end"
          >
            Website Privacy Notice
          </LinkExternal>
        </Localized>
      </div>
      <div className="w-full mobileLandscape:w-auto flex items-center mt-3 mobileLandscape:mt-0 mobileLandscape:ml-10">
        <Localized id="app-footer-terms-of-service">
          <LinkExternal
            data-testid="link-terms"
            href="https://www.mozilla.org/about/legal/terms/services/"
            className="transition-standard text-xs mobileLandscape:self-end hover:text-grey-500 hover:underline"
          >
            Terms of Service
          </LinkExternal>
        </Localized>
      </div>
    </footer>
  );
};

export default Footer;
