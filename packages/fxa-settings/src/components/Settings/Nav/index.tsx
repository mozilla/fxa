/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { ReactComponent as OpenExternal } from './open-external.svg';
import { useAccount, useConfig } from '../../../models';
import { Localized } from '@fluent/react';

const navActiveClass = 'nav-active';

// Update the active nav class when this percentage of a section is shown on screen
const STANDARD_SECTION_THRESHOLD = 0.8;
const LONG_SECTION_THRESHOLD = 0.3;

export const Nav = ({
  profileRef,
  securityRef,
  connectedServicesRef,
  linkedAccountsRef,
  dataCollectionRef,
}: {
  profileRef?: React.MutableRefObject<HTMLDivElement | null>;
  securityRef?: React.MutableRefObject<HTMLDivElement | null>;
  connectedServicesRef?: React.MutableRefObject<HTMLDivElement | null>;
  linkedAccountsRef?: React.MutableRefObject<HTMLDivElement | null>;
  dataCollectionRef?: React.MutableRefObject<HTMLDivElement | null>;
}) => {
  const account = useAccount();
  const config = useConfig();
  const profileLinkRef = useRef<HTMLAnchorElement>(null);
  const securityLinkRef = useRef<HTMLAnchorElement>(null);
  const connectedServicesLinkRef = useRef<HTMLAnchorElement>(null);
  const linkedAccountsLinkRef = useRef<HTMLAnchorElement>(null);
  const dataCollectionLinkRef = useRef<HTMLAnchorElement>(null);

  const primaryEmail = account.primaryEmail.email;
  const hasSubscription = account.subscriptions.length > 0;
  const hasLinkedAccounts = account.linkedAccounts.length > 0;
  const marketingCommPrefLink =
    config.marketingEmailPreferencesUrl &&
    `${config.marketingEmailPreferencesUrl}?email=${encodeURIComponent(
      primaryEmail
    )}`;

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    if (
      profileRef?.current &&
      profileLinkRef.current &&
      securityRef?.current &&
      securityLinkRef.current &&
      connectedServicesRef?.current &&
      connectedServicesLinkRef.current &&
      dataCollectionRef?.current &&
      dataCollectionLinkRef.current
    ) {
      const options = {
        // Run the callback function when these thresholds are passed per section.
        // Add 0.01 so the threshold can be checked after the callback and class added.
        // Subtract .01 so the class is removed after the threshold has passed.
        threshold: [
          LONG_SECTION_THRESHOLD + 0.01,
          LONG_SECTION_THRESHOLD - 0.01,
          STANDARD_SECTION_THRESHOLD + 0.01,
          STANDARD_SECTION_THRESHOLD - 0.01,
        ],
      };
      observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          // Sections must have an ID beginning with "name-section" where "name" matches
          // the nav link href. e.g. <a href="security" should have a corresponding
          // section ID, id="security-section". They also must have a section ref.
          const anchorId = entry.target.id.substring(
            0,
            entry.target.id.indexOf('-section')
          );

          let navLink: HTMLAnchorElement | null;
          let sectionThreshold = STANDARD_SECTION_THRESHOLD;
          switch (anchorId) {
            case 'profile':
              navLink = profileLinkRef.current;
              break;
            case 'security':
              navLink = securityLinkRef.current;
              break;
            case 'connected-services':
              navLink = connectedServicesLinkRef.current;
              sectionThreshold = LONG_SECTION_THRESHOLD;
              break;
            case 'linked-accounts':
              navLink = linkedAccountsLinkRef.current;
              break;
            case 'data-collection':
              navLink = dataCollectionLinkRef.current;
              break;
            default:
              navLink = profileLinkRef.current;
          }

          if (
            entry.isIntersecting &&
            entry.intersectionRatio > sectionThreshold
          ) {
            if (!navLink?.classList.contains(navActiveClass)) {
              navLink?.classList.add(navActiveClass);
            }
          } else if (navLink?.classList.contains(navActiveClass)) {
            navLink.classList.remove(navActiveClass);
          }
        });
      }, options);
      observer.observe(profileRef.current);
      observer.observe(securityRef.current);
      observer.observe(connectedServicesRef.current);
      observer.observe(dataCollectionRef.current);
      if (linkedAccountsRef?.current) {
        observer.observe(linkedAccountsRef.current);
      }
    }
    return () => {
      observer?.disconnect();
    };
  }, [
    profileRef,
    securityRef,
    connectedServicesRef,
    dataCollectionRef,
    linkedAccountsRef,
  ]);

  return (
    <nav
      // top-[7.69rem] allows the sticky nav header to align exactly with first section heading
      className="font-header fixed bg-white w-full inset-0 mt-19 desktop:mt-0 desktop:sticky desktop:top-[7.69rem] desktop:bg-transparent text-xl desktop:text-base"
      data-testid="nav"
    >
      <ul className="px-6 py-8 tablet:px-8 desktop:p-0 text-start">
        <li className="mb-5">
          <Localized id="nav-settings">
            <h2 className="font-bold">Settings</h2>
          </Localized>
          <ul className="ms-4">
            <li className="mt-3">
              <Localized id="nav-profile">
                <a
                  data-testid="nav-link-profile"
                  href="#profile"
                  ref={profileLinkRef}
                  className={classNames(
                    navActiveClass,
                    'inline-block py-1 px-2 hover:bg-grey-100'
                  )}
                >
                  Profile
                </a>
              </Localized>
            </li>
            <li className="mt-3">
              <Localized id="nav-security">
                <a
                  href="#security"
                  data-testid="nav-link-security"
                  className="inline-block py-1 px-2 hover:bg-grey-100"
                  ref={securityLinkRef}
                >
                  Security
                </a>
              </Localized>
            </li>
            <li className="mt-3">
              <Localized id="nav-connected-services">
                <a
                  href="#connected-services"
                  data-testid="nav-link-connected-services"
                  className="inline-block py-1 px-2 hover:bg-grey-100"
                  ref={connectedServicesLinkRef}
                >
                  Connected Services
                </a>
              </Localized>
            </li>
            {hasLinkedAccounts && (
              <li className="mt-3">
                <Localized id="nav-linked-accounts">
                  <a
                    href="#linked-accounts"
                    data-testid="nav-link-linked-accounts"
                    className="inline-block py-1 px-2 hover:bg-grey-100"
                    ref={linkedAccountsLinkRef}
                  >
                    Linked Accounts
                  </a>
                </Localized>
              </li>
            )}
            <li className="mt-3">
              <Localized id="nav-data-collection">
                <a
                  href="#data-collection"
                  data-testid="nav-link-data-collection"
                  className="inline-block py-1 px-2 hover:bg-grey-100"
                  ref={dataCollectionLinkRef}
                >
                  Data Collection and Use
                </a>
              </Localized>
            </li>
          </ul>
        </li>

        {hasSubscription && (
          <li className="mb-5">
            <LinkExternal
              className="font-bold"
              data-testid="nav-link-subscriptions"
              href="/subscriptions"
            >
              <Localized id="nav-paid-subs">Paid Subscriptions</Localized>
              <OpenExternal
                className="inline-block w-3 h-3 ml-1"
                aria-hidden="true"
              />
            </LinkExternal>
          </li>
        )}

        {marketingCommPrefLink && (
          <li>
            <LinkExternal
              className="font-bold"
              data-testid="nav-link-newsletters"
              href={marketingCommPrefLink}
            >
              <Localized id="nav-email-comm">Email Communications</Localized>
              <OpenExternal
                className="inline-block w-3 h-3 ms-1 transform rtl:-scale-x-1"
                aria-hidden="true"
              />
            </LinkExternal>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
