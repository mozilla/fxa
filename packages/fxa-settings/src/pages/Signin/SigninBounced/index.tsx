/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { RouteComponentProps /*useNavigate*/ } from '@reach/router';
import { usePageViewEvent, logViewEvent } from '../../../lib/metrics';
import { ReactComponent as EmailBounced } from './graphic_email_bounced.svg';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver, useWindowWrapper } from '../../../models/hooks';

import LinkExternal from 'fxa-react/components/LinkExternal';
import AppLayout from '../../../components/AppLayout';
import { REACT_ENTRYPOINT } from '../../../constants';
import CardHeader from '../../../components/CardHeader';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

export type SigninBouncedProps = {
  email?: string;
  emailLookupComplete: boolean;
  onBackButtonClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  canGoBack?: boolean;
};

export const viewName = 'signin-bounced';

const SigninBounced = ({
  email,
  emailLookupComplete,
  canGoBack,
  onBackButtonClick,
}: SigninBouncedProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  const ftlMessageResolver = useFtlMsgResolver();
  const backText = ftlMessageResolver.getMsg('back', 'Back');
  // const navigate = useNavigate();

  const handleNavigationBack = (event: any) => {
    logViewEvent(viewName, 'link.back', REACT_ENTRYPOINT);
    if (onBackButtonClick) {
      onBackButtonClick(event);
    } else {
      window.history.back();
    }
  };

  useEffect(() => {
    if (emailLookupComplete && !email) {
      // TODO: Going from react page to non-react page will require a hard
      // navigate. When signin flow has been converted we should be able
      // to use `navigate`
      // navigate('/signin?showReactApp=true', { replace: true });
      window.location.replace('/signin');
    }
  }, [email, emailLookupComplete /*, navigate*/]);

  const createAccountHandler = () => {
    logViewEvent(viewName, 'link.create-account', REACT_ENTRYPOINT);
    localStorage.removeItem('__fxa_storage.accounts');
    sessionStorage.clear();
    // TODO: Going from react page to non-react page will require a hard
    // navigate. When signup flow has been converted we should be able
    // to use `navigate`
    // navigate('/signup?showReactApp=true', { replace: true });
    window.location.replace('/signup');
  };

  return (
    <AppLayout>
      {email ? (
        <>
          <CardHeader
            headingText="Sorry. We’ve locked your account."
            headingTextFtlId="signin-bounced-header"
          />
          <section>
            <div className="flex justify-center mx-auto">
              <EmailBounced className="w-3/5" role="img" />
            </div>
            <FtlMsg id="signin-bounced-message" vars={{ email }}>
              <p className="text-sm mb-6">
                The confirmation email we sent to {email} was returned and we’ve
                locked your account to protect your Firefox data.
              </p>
            </FtlMsg>

            <FtlMsg
              id="signin-bounced-help"
              elems={{
                linkExternal: (
                  <button
                    className="link-blue"
                    onClick={() => {
                      logViewEvent(viewName, 'link.support', REACT_ENTRYPOINT);
                      window.location.replace('https://support.mozilla.org/');
                    }}
                  >
                    let us know
                  </button>
                ),
              }}
            >
              <p className="text-sm mb-6 text-grey-400">
                If this is a valid email address,{' '}
                <button
                  className="link-blue"
                  onClick={() => {
                    logViewEvent(viewName, 'link.support', REACT_ENTRYPOINT);
                    window.location.replace('https://support.mozilla.org/');
                  }}
                >
                  let us know
                </button>{' '}
                and we can help unlock your account.
              </p>
            </FtlMsg>

            <div className="flex flex-col link-blue text-sm">
              <button
                data-testid="signin-bounced-create-account-btn"
                id="create-account"
                className="mb-2 opacity-0 animate-delayed-fade-in"
                onClick={createAccountHandler}
              >
                <FtlMsg id="signin-bounced-create-new-account">
                  No longer own that email? Create a new account
                </FtlMsg>
              </button>
              {canGoBack && (
                <button
                  className="opacity-0 animate-delayed-fade-in"
                  onClick={handleNavigationBack}
                  data-testid="signin-bounced-back-btn"
                  title={backText}
                >
                  <FtlMsg id="back">Back</FtlMsg>
                </button>
              )}
            </div>
          </section>
        </>
      ) : (
        <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center select-none" />
      )}
    </AppLayout>
  );
};

export default SigninBounced;
