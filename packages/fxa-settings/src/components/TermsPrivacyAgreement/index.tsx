/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { Link } from '@reach/router';
import LinkExternal from 'fxa-react/components/LinkExternal';

export type TermsPrivacyAgreementProps = {
  isPocketClient?: boolean;
};

const TermsPrivacyAgreement = ({
  isPocketClient = false,
}: TermsPrivacyAgreementProps) => {
  return (
    <div className="text-grey-500 mt-5 text-xs">
      {isPocketClient ? (
        <>
          <FtlMsg id="terms-privacy-agreement-intro">
            <p>By proceeding, you agree to:</p>
          </FtlMsg>
          <ul>
            <FtlMsg
              id="terms-privacy-agreement-pocket"
              elems={{
                pocketTos: (
                  <LinkExternal
                    className="link-grey"
                    href="https://getpocket.com/tos/"
                  >
                    Terms of Service
                  </LinkExternal>
                ),
                pocketPrivacy: (
                  <LinkExternal
                    className="link-grey"
                    href="https://getpocket.com/privacy/"
                  >
                    Privacy Notice
                  </LinkExternal>
                ),
              }}
            >
              <li>
                Pocket’s{' '}
                <LinkExternal
                  className="link-grey"
                  href="https://getpocket.com/tos/"
                >
                  Terms of Service
                </LinkExternal>{' '}
                and{' '}
                <LinkExternal
                  className="link-grey"
                  href="https://getpocket.com/privacy/"
                >
                  Privacy Notice
                </LinkExternal>
              </li>
            </FtlMsg>
            <FtlMsg
              id="terms-privacy-agreement-firefox"
              elems={{
                firefoxTos: (
                  <Link className="link-grey" to="/legal/terms">
                    Terms of Service
                  </Link>
                ),
                firefoxPrivacy: (
                  <Link className="link-grey" to="/legal/privacy">
                    Privacy Notice
                  </Link>
                ),
              }}
            >
              <li>
                Firefox’s{' '}
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
          id="terms-privacy-agreement-default"
          elems={{
            firefoxTos: (
              <Link className="link-grey" to="/legal/terms">
                Terms of Service
              </Link>
            ),
            firefoxPrivacy: (
              <Link className="link-grey" to="/legal/privacy">
                Privacy Notice
              </Link>
            ),
          }}
        >
          <p>
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
