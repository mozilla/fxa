/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { ScrollToTop } from '../Settings/ScrollToTop';
import Settings from '../Settings';
import { QueryParams } from '../..';
import CannotCreateAccount from '../../pages/CannotCreateAccount';
import Clear from '../../pages/Clear';
import CookiesDisabled from '../../pages/CookiesDisabled';
import ResetPassword from '../../pages/ResetPassword';
import ConfirmResetPassword from '../../pages/ResetPassword/ConfirmResetPassword';

import ResetPasswordWithRecoveryKeyVerified from '../../pages/ResetPassword/ResetPasswordWithRecoveryKeyVerified';
import Legal from '../../pages/Legal';
import LegalTerms from '../../pages/Legal/Terms';
import LegalPrivacy from '../../pages/Legal/Privacy';

import CompleteResetPassword from '../../pages/ResetPassword/CompleteResetPassword';
import ResetPasswordConfirmed from '../../pages/ResetPassword/ResetPasswordConfirmed';
import AccountRecoveryResetPassword from '../../pages/ResetPassword/AccountRecoveryResetPassword';
import { useAccount } from '../../models';

export const App = ({
  flowQueryParams,
}: { flowQueryParams: QueryParams } & RouteComponentProps) => {
  const { showReactApp } = flowQueryParams;
  const account = useAccount();

  return (
    <>
      <Router basepath={'/'}>
        <ScrollToTop default>
          {/* We probably don't need a guard here with `showReactApp` or a feature flag/config
           * check since users will be served the Backbone version of pages if either of those
           * are false, but guard with query param anyway since we have it handy */}
          {showReactApp && (
            <>
              <CannotCreateAccount path="/cannot_create_account/*" />
              <Clear path="/clear/*" />
              <CookiesDisabled path="/cookies_disabled/*" />

              <Legal path="/legal/*" />
              <LegalTerms path="/legal/terms/*" />
              <LegalTerms path="/:locale/legal/terms/*" />
              <LegalPrivacy path="/legal/privacy/*" />
              <LegalPrivacy path="/:locale/legal/privacy/*" />

              <ResetPassword path="/reset_password/*" />
              <ConfirmResetPassword path="/confirm_reset_password/*" />
              <CompleteResetPassword path="/complete_reset_password/*" />
              <ResetPasswordConfirmed path="/reset_password_verified/*" />
              <ResetPasswordWithRecoveryKeyVerified path="/reset_password_with_recovery_key_verified/*" />
              <AccountRecoveryResetPassword
                path="/account_recovery_reset_password/*"
                // Since the account object supports the PasswordResetAccount interface, We could just pass in
                // account like so:
                //
                // account={ account }

                // Or we could provide a custom implementation without effecting other components. As you can see,
                // this interface has taken what was once a 'tight' coupling and turned it into a 'loose' coupling
                // The AccountRecoveryResetPassword no longer cares or is concerned with account, but rather it
                // just cares that a small portion of that model is present.
                //
                // What are thoughts here. Is the code:
                // - easier to understand?
                // - easier to test?
                // - more flexible?
                //
                account={{
                  recoveryKey: account.recoveryKey,
                  resetPassword: account.resetPassword,
                  resetPasswordWithRecoveryKey:
                    account.resetPasswordWithRecoveryKey,

                  //
                  // Just a contrived scenario....
                  // Let's say for some reason, we want to change the behavior of setLastLogin.
                  // Maybe we want to make it fail fast so that qa knows it's not implemented
                  // and stops further testing.
                  //
                  setLastLogin: (_: number) => {
                    throw new Error('Coming Soon!');
                  },
                }}
              />
            </>
          )}
          <Settings path="/settings/*" {...{ flowQueryParams }} />
        </ScrollToTop>
      </Router>
    </>
  );
};

export default App;
