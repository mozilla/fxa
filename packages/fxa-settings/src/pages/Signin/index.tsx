/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { usePageViewEvent } from '../../lib/metrics';
import { useFtlMsgResolver } from '../../models';
import { MozServices } from '../../lib/types';
import { FtlMsg } from 'fxa-react/lib/utils';
import { RouteComponentProps, Link } from '@reach/router';
import InputPassword from '../../components/InputPassword';
import { ReactComponent as PocketLogo } from './pocket.svg';
import TermsPrivacyAgreement from '../../components/TermsPrivacyAgreement';
import { REACT_ENTRYPOINT } from '../../constants';

export type SigninProps = {
  email: string;
  isPasswordNeeded: boolean;
  ServiceLogo?: React.ElementType;
  serviceName?: MozServices;
};

export const viewName = 'signin';

const Signin = ({
  email,
  isPasswordNeeded,
  ServiceLogo,
  serviceName,
}: SigninProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const isPocketClient = serviceName === MozServices.Pocket;
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedPasswordFormLabel = ftlMsgResolver.getMsg(
    'password',
    'Password'
  );

  const signInUsingLoggedInAccount = useCallback(() => {
    // TODO: add in functionality to sign in using the logged in account
    // return an error to be displayed if anythign goes wrong.
  }, []);

  const signInWithPassword = useCallback((email: string, password: string) => {
    // TODO: add in the functionality to actually sign a user in using their password
    // return an error to be displayed if anything goes wrong.
  }, []);

  // TODO: This page is also supposed to render the user card, complete with avatar.

  // TODO: The user-card mixin does some fancy footwork listening to see if you access token changes
  // because it's possible for the access token to be invalidated when we display the avatar image.
  // if we get the notification of a change, we re-render the card.

  const onSubmit = useCallback(async () => {
    try {
      isPasswordNeeded
        ? signInWithPassword(email, password)
        : signInUsingLoggedInAccount();
      // TODO: add message in Banner re: success, then navigate to where appropriate
    } catch (e) {
      // TODO: metrics event for error
      // TODO: Add in localized Banner message for error
      setError(e);
    }
  }, [
    email,
    password,
    signInUsingLoggedInAccount,
    signInWithPassword,
    isPasswordNeeded,
    setError,
  ]);

  // TODO:
  // Add in the Banner component in place of the original `success` and `error` display divs

  return (
    <>
      <div className="mb-4">
        {isPasswordNeeded ? (
          <FtlMsg id="signin-password-needed-header">
            <h1 className="card-header">
              Enter your password{' '}
              <span className="card-subheader">for your Firefox account</span>
            </h1>
          </FtlMsg>
        ) : (
          <>
            <FtlMsg id="signin-header">
              <h1 className="card-header">Sign in</h1>
            </FtlMsg>
            <>
              {isPocketClient && (
                <FtlMsg id="signin-subheader-with-logo">
                  <span className="card-subheader">
                    Continue to{' '}
                    <span>
                      <PocketLogo
                        className="inline"
                        aria-label={MozServices.Pocket}
                      />
                    </span>
                  </span>
                </FtlMsg>
              )}
              {!isPocketClient && ServiceLogo && (
                <FtlMsg id="signin-subheader-with-logo">
                  <span className="card-subheader">
                    Continue to{' '}
                    <span>
                      <ServiceLogo
                        className="inline"
                        aria-label={serviceName}
                      />
                    </span>
                  </span>
                </FtlMsg>
              )}
              {!isPocketClient &&
                !ServiceLogo &&
                (serviceName ? (
                  <FtlMsg
                    id="signin-subheader-without-logo-with-servicename"
                    vars={{ serviceName }}
                  >
                    <span className="card-subheader">
                      Continue to {serviceName}
                    </span>
                  </FtlMsg>
                ) : (
                  <FtlMsg id="signin-subheader-without-logo-default">
                    <span className="card-subheader">
                      {`Continue to ${MozServices.Default}`}
                    </span>
                  </FtlMsg>
                ))}
            </>
          </>
        )}
      </div>
      <section>
        {/* Alerts and success messages originally went here */}
        <div className="mt-9">
          {/* When we get to the functionality stage, we can probably replace this with the Avatar component in Settings*/}
          <div className="mx-auto h-24 w-24 mobileLandscape:h-40 mobileLandscape:w-40"></div>
          <div className="my-5 text-base break-all">{email}</div>
        </div>
        <form noValidate {...{ onSubmit }}>
          <input type="email" className="email hidden" value={email} disabled />

          {isPasswordNeeded && (
            <InputPassword
              anchorStart
              className="mb-5 text-start"
              label={localizedPasswordFormLabel}
              hasErrors={error.length > 0}
              errorText={error}
              tooltipPosition="bottom"
              required
              autoFocus
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
          )}
          {/* This non-fulfilled input tricks the browser, when trying to
              sign in with the wrong password, into not showing the doorhanger.
           */}
          <input className="hidden" required />

          <div className="flex">
            <FtlMsg id="signin-button">
              <button className="cta-primary cta-xl" type="submit">
                Sign in
              </button>
            </FtlMsg>
          </div>
        </form>
        {isPocketClient ? (
          <TermsPrivacyAgreement isPocketClient />
        ) : (
          <TermsPrivacyAgreement />
        )}
        <div className="flex justify-between">
          <FtlMsg id="signin-use-a-different-account">
            <Link to="/" className="text-sm link-blue">
              Use a different account
            </Link>
          </FtlMsg>
          <FtlMsg id="signin-forgot-password">
            <Link to="/reset_password" className="text-sm link-blue">
              Forgot password?
            </Link>
          </FtlMsg>
        </div>
      </section>
    </>
  );
};

export default Signin;
