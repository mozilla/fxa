/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { usePageViewEvent } from '../../lib/metrics';
import { useAccount, useFtlMsgResolver, useInitialState } from '../../models';
import { MozServices } from '../../lib/types';
import { FtlMsg } from 'fxa-react/lib/utils';
import { RouteComponentProps, Link } from '@reach/router';
import InputPassword from '../../components/InputPassword';
import TermsPrivacyAgreement from '../../components/TermsPrivacyAgreement';
import { REACT_ENTRYPOINT } from '../../constants';
import CardHeader from '../../components/CardHeader';
// import Avatar from '../../components/Settings/Avatar';
import AppLayout from '../../components/AppLayout';
import Banner, { BannerProps } from '../../components/Banner';
import { useForm } from 'react-hook-form';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { clearSignedInAccountUid } from '../../lib/cache';

/* Reasons why the user must be asked for a password to use `account`
     - If the account doesn't have a sessionToken
       BEFORE: !account.get('sessionToken')
     - If the account doesn't yet have an email address
       BEFORE: !account.get('email')
     - If the relier wants keys, then the user must authenticate and the password must be requested.
       This includes sync, which must skip the login chooser at all cost
       BEFORE: this.relier.wantsKeys()
     - If relier is requesting `prompt=login`
       BEFORE: this.relier.isOAuth() && this.relier.wantsLogin()
     - When a prefill email does not match the account email
       BEFORE: prefillEmail && prefillEmail !== account.get('email')
  */

// TODO: get email from content-server with getSearchParams
export type SigninProps = {
  userEmail?: string;
  isPasswordNeeded?: boolean;
  serviceName?: MozServices;
};

type FormData = {
  password: string;
};

export const viewName = 'signin';

const Signin = ({
  // temporary defaults until this page is hooked up to receive cached Account data
  userEmail,
  isPasswordNeeded = true,
  serviceName,
}: SigninProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const account = useAccount();
  const [email, setEmail] = useState(userEmail || 'boop@boop.com');
  const { loading } = useInitialState();
  const isPocketClient = serviceName === MozServices.Pocket;
  const [errorText, setErrorText] = useState<string>('');
  const [bannerDetails, setBannerDetails] = useState<BannerProps>();
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedPasswordFormLabel = ftlMsgResolver.getMsg(
    'password',
    'Password'
  );
  const localizedPasswordRequiredErrorMessage = ftlMsgResolver.getMsg(
    'signin-password-required-error',
    'Your password is required to sign in'
  );

  const { handleSubmit, register, getValues, errors } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      password: '',
    },
  });

  useEffect(() => {
    if (!loading && account) {
      setEmail(account.primaryEmail.email);
    }
  }, [loading, setEmail, account]);

  useEffect(() => {
    if (errors?.password?.type === 'required') {
      setErrorText(localizedPasswordRequiredErrorMessage);
    }
  }, [errors, setErrorText, localizedPasswordRequiredErrorMessage]);

  // TODO: Extract all of these functions from the component

  /**
   * Sign in without a password, used when `account` already has
   * a session that can be used to sign in again.
   **/
  function signInUsingLoggedInAccount() {
    /** TODO: TRY all of the following
     *
     * TODO: Store formPrefill (in context???)
     *       set the formPrefill email in case the signin fails,
     *       the email will be prefilled on the legacy signin page.
     *       *** IS THIS STILL NEEDED?***
     *
     * TODO: Retrieve accountProfile from auth-client with sessionToken
     *       and check if the account has TOTP enabled
     *       BEFORE:
     *       if (
     *         profile.authenticationMethods &&
     *         profile.authenticationMethods.includes('otp')
     *       ) {
     *         account.set('verificationMethod', VerificationMethods.TOTP_2FA);
     *       }
     *       *** HOW DO WE SET VERIFICATION METHODS IN FXA_SETTINGS? ***
     *
     * TODO: Handle the signin and emit metrics
     *       Signing in with cached credentials does not hit auth-server,
     *       so the metrics event must be emitted here.
     *       BEFORE:
     *       *** IS THIS signIn FROM AUTH_CLIENT?
     *       this.signIn(account, null, {
     *         onSuccess: () => this.logEvent('cached.signin.success'),
     *       });
     *
     * TODO: Catch errors if sessionToken was invalid (sign in aborted)
     *       BEFORE:
     *       // Session was invalid. Set a SESSION EXPIRED error on the model
     *       // causing an error to be displayed when the view re-renders
     *       // due to the sessionToken update.
     *       if (AuthErrors.is(err, 'INVALID_TOKEN')) {
     *         account.discardSessionToken();
     *         this.model.set('error', AuthErrors.toError('SESSION_EXPIRED'));
     *       } else {
     *         throw err;
     *       }
     * */
  }

  function signIn(email: string, password: string) {
    // TODO: add in the functionality to actually sign a user in using their password
    // return an error to be displayed if anything goes wrong.
  }

  // TODO: This page is also supposed to render the user card, complete with avatar.

  // TODO: The user-card mixin does some fancy footwork listening to see if you access token changes
  // because it's possible for the access token to be invalidated when we display the avatar image.
  // if we get the notification of a change, we re-render the card.

  const attemptSignIn = async () => {
    const password: string = getValues('password');
    // log sign in attempt
    if (isPasswordNeeded) {
      try {
        signIn(email, password);
        // log signin success metric
      } catch (e) {
        // TODO: metrics event for error
        // TODO: setBannerDetails for other errors
      }
    } else {
      try {
        signInUsingLoggedInAccount();
        // log signin success metric
      } catch (e) {
        // TODO: metrics event for error
        // TODO: setBannerDetails for other errors
      }
    }
  };

  const clearErrorMessages = () => {
    setErrorText('');
    setBannerDetails(undefined);
  };

  // TODO: Going from react page to non-react page will require a hard
  // navigate. When signup flow has been fully converted we should be able
  // to use `navigate`.
  function navigateToSigninSignup() {
    clearSignedInAccountUid();
    window.location.assign(`${window.location.origin}/`);
  }

  // if the account (and/or email) isn't available, redirect to signin/signup
  // BEFORE: if (!account || !account.get('email'))
  if (!loading && !email) {
    navigateToSigninSignup();
    return <LoadingSpinner />;
  }

  return (
    <AppLayout title="">
      {isPasswordNeeded ? (
        <CardHeader
          headingText="Enter your password"
          headingAndSubheadingFtlId="signin-password-needed-header"
        />
      ) : (
        <CardHeader
          headingText="Sign in"
          headingTextFtlId="signin-header"
          subheadingWithDefaultServiceFtlId="signin-subheader-without-logo-default"
          subheadingWithCustomServiceFtlId="signin-subheader-without-logo-with-servicename"
          subheadingWithLogoFtlId="signin-subheader-with-logo"
          {...{ serviceName }}
        />
      )}
      {bannerDetails && (
        <Banner type={bannerDetails.type}>{bannerDetails.children}</Banner>
      )}
      <section>
        <div className="mt-9">
          {/* Enable Avatar when cached ProfileData can be accessed in unauthenticated flow */}
          {/* <Avatar className="mx-auto h-24 w-24 mobileLandscape:h-40 mobileLandscape:w-40" /> */}
          <div className="my-5 text-base break-all">{email}</div>
        </div>
        <form noValidate onSubmit={handleSubmit(attemptSignIn)}>
          <input type="email" className="email hidden" value={email} disabled />

          {isPasswordNeeded && (
            <InputPassword
              name="password"
              anchorStart
              className="mb-5 text-start"
              label={localizedPasswordFormLabel}
              tooltipPosition="bottom"
              required
              autoFocus
              onChange={clearErrorMessages}
              inputRef={register({
                required: true,
              })}
              {...{ errorText }}
            />
          )}

          <div className="flex">
            <FtlMsg id="signin-button">
              <button className="cta-primary cta-xl" type="submit">
                Sign in
              </button>
            </FtlMsg>
          </div>
        </form>

        <TermsPrivacyAgreement {...{ isPocketClient }} />

        {/* A user who came from an OAuth relier and was directed directly to /signin
        will not be able to go back. Send them directly to `/` with the account state.
        The email will be prefilled on that page. */}
        <div className="flex justify-between">
          <FtlMsg id="signin-use-a-different-account">
            {/* TODO: Going from react page to non-react page requires a hard
            navigate. When signin flow has been fully converted we should be able
            to use a Link component. */}
            <button
              onClick={navigateToSigninSignup}
              className="text-sm link-blue"
            >
              Use a different account
            </button>
          </FtlMsg>
          <FtlMsg id="signin-forgot-password">
            <Link to="/reset_password" className="text-sm link-blue">
              Forgot password?
            </Link>
          </FtlMsg>
        </div>
      </section>
    </AppLayout>
  );
};

export default Signin;
