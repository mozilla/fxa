import { Localized } from '@fluent/react';
import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import Image from 'next/image';
import MOZ_LOGO from '../../public/images/moz-logo.svg';

export const Footer = () => {
  return (
    <footer className="py-4 mt-16 mx-8 flex-nowrap flex border-0 border-t border-grey-100 border-solid text-grey-400 content-center justify-between tablet:flex-wrap tablet:justify-start">
      <LinkExternal
        href="https://www.mozilla.org/about/?utm_source=firefox-accounts&utm_medium=Referral"
        data-testid="link-mozilla"
      >
        <Image
          src={MOZ_LOGO}
          alt="Mozilla logo"
          className="transition-standard w-18 h-auto opacity-75 hover:opacity-100"
        />
      </LinkExternal>
      <div className="tablet:ml-10">
        <Localized id="app-footer-privacy-notice">
          <LinkExternal
            data-testid="link-privacy"
            href="https://www.mozilla.org/en-US/privacy/websites/"
            className="transition-standard text-xs hover:text-grey-500 hover:underline mobileLandscape:self-end"
          >
            Website Privacy Notice
          </LinkExternal>
        </Localized>
      </div>
      <div className="tablet:ml-10">
        <Localized id="app-footer-terms-of-service">
          <LinkExternal
            data-testid="link-terms"
            href="https://www.mozilla.org/en-US/about/legal/terms/services/"
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
