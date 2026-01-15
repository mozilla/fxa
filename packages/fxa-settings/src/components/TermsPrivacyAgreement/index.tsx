/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { Link } from '@reach/router';
import LinkExternal from 'fxa-react/components/LinkExternal';

export interface LegalTerms {
  label: string;
  termsOfServiceLink: string;
  privacyNoticeLink: string;
  fontSize: 'default' | 'medium' | 'large';
}

export type TermsPrivacyAgreementProps = {
  legalTerms?: LegalTerms | null;
};

const TermsPrivacyAgreement = ({ legalTerms }: TermsPrivacyAgreementProps) => {
  const fontSizeClass =
    legalTerms?.fontSize === 'large'
      ? 'text-base'
      : legalTerms?.fontSize === 'medium'
        ? 'text-sm'
        : 'text-xs';

  const showCustomTos = !!legalTerms;

  return (
    <div className={`text-grey-500 ${fontSizeClass} mt-5`}>
      {showCustomTos ? (
        <>
          <FtlMsg id="terms-privacy-agreement-intro-3">
            <p>By proceeding, you agree to the following:</p>
          </FtlMsg>
          <ul>
            <FtlMsg
              id="terms-privacy-agreement-customized-terms"
              vars={{ serviceName: legalTerms.label }}
              elems={{
                termsLink: (
                  <LinkExternal
                    className="link-grey"
                    href={legalTerms.termsOfServiceLink}
                  >
                    Terms of Service
                  </LinkExternal>
                ),
                privacyLink: (
                  <LinkExternal
                    className="link-grey"
                    href={legalTerms.privacyNoticeLink}
                  >
                    Privacy Notice
                  </LinkExternal>
                ),
              }}
            >
              <li>
                {legalTerms.label}:{' '}
                <LinkExternal
                  className="link-grey"
                  href={legalTerms.termsOfServiceLink}
                >
                  Terms of Service
                </LinkExternal>{' '}
                and{' '}
                <LinkExternal
                  className="link-grey"
                  href={legalTerms.privacyNoticeLink}
                >
                  Privacy Notice
                </LinkExternal>
              </li>
            </FtlMsg>
            <FtlMsg
              id="terms-privacy-agreement-mozilla-2"
              elems={{
                mozillaAccountsTos: (
                  <Link className="link-grey" to="/legal/terms">
                    Terms of Service
                  </Link>
                ),
                mozillaAccountsPrivacy: (
                  <Link className="link-grey" to="/legal/privacy">
                    Privacy Notice
                  </Link>
                ),
              }}
            >
              <li>
                Mozilla Accounts:{' '}
                <Link className="link-grey" to="/legal/terms">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link className="link-grey" to="/legal/privacy">
                  Privacy Notice
                </Link>
              </li>
            </FtlMsg>
          </ul>
        </>
      ) : (
        <FtlMsg
          id="terms-privacy-agreement-default-2"
          data-testid="terms-privacy-agreement-default"
          elems={{
            mozillaAccountsTos: (
              <Link className="link-grey" to="/legal/terms">
                Terms of Service
              </Link>
            ),
            mozillaAccountsPrivacy: (
              <Link className="link-grey" to="/legal/privacy">
                Privacy Notice
              </Link>
            ),
          }}
        >
          <p data-testid="terms-privacy-agreement-default">
            By proceeding, you agree to the{' '}
            <Link className="link-grey" to="/legal/terms">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link className="link-grey" to="/legal/privacy">
              Privacy Notice
            </Link>
            .
          </p>
        </FtlMsg>
      )}
    </div>
  );
};

export default TermsPrivacyAgreement;
