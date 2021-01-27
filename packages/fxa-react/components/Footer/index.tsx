/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized, useLocalization } from '@fluent/react';
import React from 'react';
import LinkExternal from '../LinkExternal';
import { ReactComponent as MozLogo } from './moz-logo.svg';

export const Footer = () => {
  const { l10n } = useLocalization();
  return (
    <footer
      className="py-4 mt-16 mx-4 flex-wrap mobileLandscape:flex-no-wrap mobileLandscape:mx-8 mobileLandscape:pb-6 flex border-t border-grey-100 text-grey-400"
      data-testid="footer"
    >
      <LinkExternal
        href="https://www.mozilla.org/about/?utm_source=firefox-accounts&utm_medium=Referral"
        data-testid="link-mozilla"
      >
        <MozLogo
          aria-label={l10n.getString('app-footer-mozilla-logo-label')}
          role="img"
          className="transition-standard w-18 h-auto opacity-75 hover:opacity-100"
        />
      </LinkExternal>
      <Localized id="app-footer-privacy-notice">
        <LinkExternal
          data-testid="link-privacy"
          href="https://www.mozilla.org/en-US/privacy/websites/"
          className="transition-standard w-full text-xs my-3 hover:text-grey-500 hover:underline mobileLandscape:my-0 mobileLandscape:w-auto mobileLandscape:mx-10 mobileLandscape:self-end"
        >
          Website Privacy Notice
        </LinkExternal>
      </Localized>
      <Localized id="app-footer-terms-of-service">
        <LinkExternal
          data-testid="link-terms"
          href="https://www.mozilla.org/en-US/about/legal/terms/services/"
          className="transition-standard w-full text-xs mobileLandscape:self-end hover:text-grey-500 hover:underline mobileLandscape:w-auto"
        >
          Terms of Service
        </LinkExternal>
      </Localized>
    </footer>
  );
};

export default Footer;
