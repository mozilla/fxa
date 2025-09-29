/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { Link } from '@reach/router';
import LinkExternal from 'fxa-react/components/LinkExternal';

export type TermsPrivacyAgreementProps = {
  isMonitorClient?: boolean;
  isRelayClient?: boolean; // Relay is oauth RP
  isFirefoxClientServiceRelay?: boolean; // `service=relay` on Fx desktop or mobile client ID
};

const TermsPrivacyAgreement = ({
  isMonitorClient = false,
  isRelayClient = false,
  isFirefoxClientServiceRelay = false,
}: TermsPrivacyAgreementProps) => {
  return (
    <div
      className={`text-grey-500 text-xs ${isFirefoxClientServiceRelay ? 'mt-8' : 'mt-5'}`}
    >
      {isMonitorClient || isFirefoxClientServiceRelay || isRelayClient ? (
        <>
          <FtlMsg id="terms-privacy-agreement-intro-2">
            <p>By proceeding, you agree to the:</p>
          </FtlMsg>
          <ul>
            {(isMonitorClient ||
              isFirefoxClientServiceRelay ||
              isRelayClient) && (
              <FtlMsg
                id="terms-privacy-agreement-monitor-3"
                elems={{
                  mozSubscriptionTosLink: (
                    <LinkExternal
                      className="link-grey"
                      href="https://www.mozilla.org/about/legal/terms/subscription-services/"
                    >
                      Terms of Service
                    </LinkExternal>
                  ),
                  mozSubscriptionPrivacyLink: (
                    <LinkExternal
                      className="link-grey"
                      href="https://www.mozilla.org/privacy/subscription-services/"
                    >
                      Privacy Notice
                    </LinkExternal>
                  ),
                }}
              >
                <li>
                  Mozilla Subscription Services{' '}
                  <LinkExternal
                    className="link-grey"
                    href="https://www.mozilla.org/about/legal/terms/subscription-services/"
                  >
                    Terms of Service
                  </LinkExternal>{' '}
                  and{' '}
                  <LinkExternal
                    className="link-grey"
                    href="https://www.mozilla.org/privacy/subscription-services/"
                  >
                    Privacy Notice
                  </LinkExternal>
                </li>
              </FtlMsg>
            )}
            <FtlMsg
              id="terms-privacy-agreement-mozilla"
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
                Mozilla Accounts{' '}
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
