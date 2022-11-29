/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { Localized } from '@fluent/react';

type VerificationReason =
  | 'FORCE_AUTH'
  | 'PASSWORD_RESET'
  | 'PASSWORD_RESET_WITH_RECOVERY_KEY'
  | 'PRIMARY_EMAIL_VERIFIED'
  | 'SECONDARY_EMAIL_VERIFIED'
  | 'SIGN_IN'
  | 'SIGN_UP'
  | 'SUCCESSFUL_OAUTH';

// TO-DO: add in the appropriate localization ids to `<Localized>` components
// TO-DO: escape strings --> am i wrong in thinking that react already does this...?
// TO-DO: add in the navigation etc events which were applied using Backbone events

// This code just accomplishes the first step: recreating the Ready View in React.js.
// The next steps include adding tests, eliminating unused code, and reconsidering the complexity of this view.

const escapeString = (str?: string) => (str ? str : '');

// TO-DO: fix the string interpolation here.
/*eslint-disable camelcase*/
const TEMPLATE_INFO: {
  [key in VerificationReason]: {
    emailReadyText?: string;
    headerId: string;
    headerTitle: string;
    readyToSyncText?: string;
  };
} = {
  FORCE_AUTH: {
    headerId: 'fxa-force-auth-complete-header',
    headerTitle: 'Welcome back',
    readyToSyncText: 'Firefox Sync will resume momentarily',
  },
  PASSWORD_RESET: {
    headerId: 'fxa-reset-password-complete-header',
    headerTitle: 'Your password has been reset',
    readyToSyncText:
      'Complete set-up by entering the new password on your other Firefox devices.',
  },
  PASSWORD_RESET_WITH_RECOVERY_KEY: {
    headerId: 'fxa-reset-password-complete-header',
    headerTitle: 'Your password has been reset',
    readyToSyncText:
      'Complete set-up by entering the new password on your other Firefox devices.',
  },
  PRIMARY_EMAIL_VERIFIED: {
    emailReadyText:
      'You are now ready to make changes to your Firefox Account.',
    headerId: 'fxa-sign-up-complete-header',
    headerTitle: 'Primary email confirmed',
  },
  SECONDARY_EMAIL_VERIFIED: {
    emailReadyText:
      'Account notifications will now also be sent to %(secondaryEmailVerified)s.',
    headerId: 'fxa-sign-up-complete-header',
    headerTitle: 'Secondary email confirmed',
  },
  // signin_confirmed and signin_verified are only shown to Sync for now.
  SIGN_IN: {
    headerId: 'fxa-sign-in-complete-header',
    headerTitle: 'Sign-in confirmed',
    readyToSyncText: 'You are now ready to use %(serviceName)s',
  },
  SIGN_UP: {
    headerId: 'fxa-sign-up-complete-header',
    headerTitle: 'Account confirmed',
    readyToSyncText: 'You are now ready to use %(serviceName)s',
  },
  SUCCESSFUL_OAUTH: {
    headerId: 'fxa-oauth-success-header',
    headerTitle: 'Connected',
    readyToSyncText: 'You are now ready to use %(serviceName)s',
  },
};

// Components

const ReadyShellComponent = ({
  children,
  escapedHeaderTitle,
  headerId,
}: {
  children: ReactNode;
  escapedHeaderTitle: string;
  headerId: string;
}) => {
  return (
    <div id="main-content" className="card">
      <header>
        <Localized id={headerId}>
          <h1 id={headerId}>{escapedHeaderTitle}</h1>
        </Localized>
      </header>
      {children}
      <section>
        <div className="error"></div>
        <Localized id="ready-success-checkbox">
          <div className="graphic graphic-checkbox">Success</div>
        </Localized>
        <div className="marketing-area"></div>
      </section>
    </div>
  );
};

export const PasswordResetWithRecoveryKeyComponent = () => {
  // TO-DO: add in the actual click actions.
  return (
    <>
      <div className="button-row">
        <Localized id="ready-generate-new-recovery-key">
          <button className="primary-button btn-create-recovery-key">
            Generate a new account recovery key
          </button>
        </Localized>
      </div>
      <ContinueToMyAccountComponent />
    </>
  );
};

export const FromRelyingPartyComponent = ({
  serviceLogo,
  serviceName,
  showContinueButton,
}: {
  serviceLogo: string;
  serviceName: string;
  showContinueButton: boolean;
}) => {
  return (
    <>
      <ReadyToUseSpecificServiceComponent
        serviceName={serviceName}
        serviceLogo={serviceLogo}
      />
      {showContinueButton && (
        <div className="button-row">
          <Localized id="ready-continue">
            <button className="primary-button btn-continue">Continue</button>
          </Localized>
        </div>
      )}
    </>
  );
};

export const ReadyToUseSpecificServiceComponent = ({
  serviceName,
  serviceLogo,
}: {
  serviceName: string;
  serviceLogo?: string;
}) => {
  return (
    <>
      {' '}
      <Localized id={`ready--now-ready-to-use-${serviceName}`}>
        {/* L10N: Pocket image follows `You are now ready to use` if image is present */}
        You are now ready to use{' '}
      </Localized>
      {serviceLogo ? (
        <div className={`graphic ${serviceLogo}`}>{serviceName}</div>
      ) : (
        serviceName
      )}
    </>
  );
};

export const ContinueToMyAccountComponent = () => {
  return (
    <div className="links">
      <Localized id="ready-continue-to-my-account">
        <a href="#" className="btn-goto-account">
          Continue to my account
        </a>
      </Localized>
    </div>
  );
};

export const FromAccountSettingsComponent = ({
  emailVerified,
  escapedEmailReadyText,
  isSignedIn,
  serviceName,
}: {
  emailVerified: boolean;
  escapedEmailReadyText: string;
  isSignedIn: boolean;
  serviceName: string;
}) => {
  return (
    <>
      {' '}
      {emailVerified ? (
        <>
          {/* I think this may need an email ready text id added into the template info obj*/}
          <Localized id="this-will-be-from-the-template-info-obj">
            <p className="account-ready-service">{escapedEmailReadyText}</p>
          </Localized>
          <ContinueToMyAccountComponent />
        </>
      ) : (
        <p className={`account-ready-${isSignedIn ? 'service' : 'generic'}`}>
          {isSignedIn ? (
            <ReadyToUseSpecificServiceComponent serviceName={serviceName} />
          ) : (
            <Localized id="ready-your-account-is-ready">
              'Your account is ready!'
            </Localized>
          )}
        </p>
      )}
    </>
  );
};

// Pages
export const ReadySyncPage = ({
  escapedReadyToSyncText,
  isPasswordResetWithRecoveryKey,
  verificationReason,
}: {
  escapedReadyToSyncText: string;
  isPasswordResetWithRecoveryKey: boolean;
  verificationReason: VerificationReason;
}) => {
  const { headerId, headerTitle, readyToSyncText } =
    TEMPLATE_INFO[verificationReason];
  return (
    <ReadyShellComponent
      headerId={headerId}
      escapedHeaderTitle={escapeString(headerTitle)}
    >
      <Localized id="to-do-this-will-be-from-template-info">
        <p className="account-ready-service">{escapeString(readyToSyncText)}</p>
      </Localized>
      <div className="button-row">
        <Localized id="ready-start-browsing">
          <button className="primary-button btn-start-browsing">
            Start browsing
          </button>
        </Localized>
      </div>
      {isPasswordResetWithRecoveryKey && (
        <PasswordResetWithRecoveryKeyComponent />
      )}
    </ReadyShellComponent>
  );
};

export const ReadyPage = ({
  emailVerified,
  isFromRelyingParty,
  isPasswordResetWithRecoveryKey,
  isSignedIn,
  serviceLogo,
  serviceName,
  showContinueButton,
  verificationReason,
}: {
  emailVerified: boolean;
  isFromRelyingParty: boolean;
  isPasswordResetWithRecoveryKey: boolean;
  isSignedIn: boolean;
  serviceLogo: string;
  serviceName: string;
  showContinueButton: boolean;
  verificationReason: VerificationReason;
}) => {
  const { emailReadyText, headerId, headerTitle } =
    TEMPLATE_INFO[verificationReason];
  return (
    <ReadyShellComponent
      escapedHeaderTitle={escapeString(headerTitle)}
      headerId={headerId}
    >
      {isFromRelyingParty ? (
        <FromRelyingPartyComponent
          serviceLogo={serviceLogo}
          serviceName={serviceName}
          showContinueButton={showContinueButton}
        />
      ) : (
        <FromAccountSettingsComponent
          emailVerified={emailVerified}
          escapedEmailReadyText={escapeString(emailReadyText)}
          isSignedIn={isSignedIn}
          serviceName={serviceName}
        />
      )}
      {isPasswordResetWithRecoveryKey && (
        <PasswordResetWithRecoveryKeyComponent />
      )}
    </ReadyShellComponent>
  );
};
