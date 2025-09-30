/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { useAccount, Email, useAlertBar } from '../../../models';
import UnitRow from '../UnitRow';
import { ButtonIconTrash, ButtonIconReload } from '../ButtonIcon';
import { Localized, useLocalization } from '@fluent/react';
import { SETTINGS_PATH } from '../../../constants';
import GleanMetrics from '../../../lib/glean';
import { MfaGuard } from '../MfaGuard';
import ModalVerifySession from '../ModalVerifySession';
import {
  clearMfaAndJwtCacheOnInvalidJwt,
  isInvalidJwtError,
} from '../../../lib/mfa-guard-utils';
import { MfaReason } from '../../../lib/types';

type UnitRowSecondaryEmailContentAndActionsProps = {
  secondary: Email;
  isLastVerifiedSecondaryEmail: boolean;
};

export const UnitRowSecondaryEmail = () => {
  const account = useAccount();
  const navigateWithQuery = useNavigateWithQuery();
  const alertBar = useAlertBar();
  const [queuedAction, setQueuedAction] = useState<() => void>();
  const [pendingSecondaryDelete, setPendingSecondaryDelete] = useState<
    string | undefined
  >();
  const [pendingChangePrimary, setPendingChangePrimary] = useState<
    string | undefined
  >();
  const { l10n } = useLocalization();

  const secondaryEmails = account.emails.filter((email) => !email.isPrimary);
  const hasAtLeastOneSecondaryEmail = !!secondaryEmails.length;
  const lastVerifiedSecondaryEmailIndex = secondaryEmails
    .map((email) => email.verified)
    .lastIndexOf(true);

  const resendEmailCode = useCallback(
    async (email: string) => {
      try {
        await account.resendEmailCode(email);
        navigateWithQuery(`${SETTINGS_PATH}/emails/verify`, {
          state: { email },
        });
      } catch (e) {
        alertBar.error(
          l10n.getString(
            'se-cannot-resend-code-3',
            null,
            'Sorry, there was a problem re-sending the confirmation code'
          )
        );
      }
    },
    [account, navigateWithQuery, alertBar, l10n]
  );

  const ChangePrimaryOnMount = ({ email }: { email: string }) => {
    const called = useRef(false);
    const account = useAccount();
    const alertBar = useAlertBar();
    const { l10n } = useLocalization();
    const makePrimary = useCallback(
      async (email: string) => {
        try {
          await account.makeEmailPrimaryWithJwt(email);
          alertBar.success(
            l10n.getString(
              'se-set-primary-successful-2',
              { email },
              `${email} is now your primary email`
            )
          );
          setPendingChangePrimary(undefined);
        } catch (e) {
          if (isInvalidJwtError(e)) {
            clearMfaAndJwtCacheOnInvalidJwt(e, 'email');
            return;
          }
          alertBar.error(
            l10n.getString(
              'se-set-primary-error-2',
              null,
              'Sorry, there was a problem changing your primary email'
            )
          );
          setPendingChangePrimary(undefined);
        }
      },
      [account, alertBar, l10n]
    );
    useEffect(() => {
      (async () => {
        // make sure this is only called once in it's lifecycle. However, if
        // this component is double mounted, it will still be called twice.
        if (called.current) {
          return;
        }
        called.current = true;
        await makePrimary(email);
      })();
    }, [makePrimary, email]);
    return <></>;
  };

  const DeleteEmailOnMount = ({ email }: { email: string }) => {
    const account = useAccount();
    const alertBar = useAlertBar();
    const { l10n } = useLocalization();

    useEffect(() => {
      const deleteEmail = async () => {
        try {
          await account.deleteSecondaryEmailWithJwt(email);
          alertBar.success(
            l10n.getString(
              'se-delete-email-successful-2',
              { email },
              `${email} successfully deleted`
            )
          );
        } catch (e) {
          if (isInvalidJwtError(e)) {
            clearMfaAndJwtCacheOnInvalidJwt(e, 'email');
            return;
          }
          alertBar.error(
            l10n.getString(
              'se-delete-email-error-2',
              null,
              `Sorry, there was a problem deleting this email`
            )
          );
        }
        // This will only run when MfaGuard renders this component
        // which means MFA has been completed successfully
      };
      deleteEmail();
    }, [account, alertBar, l10n, email]);

    return <></>;
  };

  const SecondaryEmailUtilities = ({ children }: { children: ReactNode }) => (
    <>
      {queuedAction && (
        <ModalVerifySession
          onDismiss={() => {
            setQueuedAction(undefined);
            alertBar.info(
              l10n.getString(
                'se-verify-session-3',
                null,
                "You'll need to confirm your current session to perform this action"
              )
            );
          }}
          onError={(error) => {
            setQueuedAction(undefined);
            alertBar.error(
              l10n.getString(
                'se-verify-session-error-3',
                null,
                'Sorry, there was a problem confirming your session'
              ),
              error
            );
          }}
          onCompleted={queuedAction}
        />
      )}
      {children}
    </>
  );

  const UnitRowSecondaryEmailNotSet = () => {
    // user doesn't have a secondary email (verified or unverified) set
    return (
      <UnitRow
        header={l10n.getString('se-heading', null, 'Secondary email')}
        headerId="secondary-email"
        prefixDataTestId="secondary-email"
        route={`${SETTINGS_PATH}/emails`}
        ctaOnClickAction={() => GleanMetrics.accountPref.secondaryEmailSubmit()}
        {...{
          alertBarRevealed: alertBar.visible,
        }}
      >
        <SecondaryEmailDefaultContent />
      </UnitRow>
    );
  };

  const UnitRowSecondaryEmailContentAndActions = ({
    secondary: { email, verified },
    isLastVerifiedSecondaryEmail,
  }: UnitRowSecondaryEmailContentAndActionsProps) => {
    return (
      <>
        <div className="@mobileLandscape/unitRow:flex unit-row-multi-row">
          <div
            className="unit-row-content @mobileLandscape/unitRow:flex-2 @desktop/unitRow:flex-4"
            data-testid="secondary-email-unit-row-content"
          >
            <p
              className="font-bold break-all"
              data-testid="secondary-email-unit-row-header-value"
            >
              <span className="flex justify-between items-center">
                {email}
                <span>
                  <Localized id="se-remove-email" attrs={{ title: true }}>
                    <ButtonIconTrash
                      title="Remove email"
                      classNames="@mobileLandscape/unitRow:hidden ms-1"
                      disabled={account.loading}
                      onClick={() => {
                        setPendingSecondaryDelete(email);
                      }}
                    />
                  </Localized>
                  {!verified && (
                    <Localized id="se-refresh-email" attrs={{ title: true }}>
                      <ButtonIconReload
                        title="Refresh email"
                        classNames="@mobileLandscape/unitRow:hidden ms-1"
                        disabled={account.loading}
                        onClick={() => account.refresh('account')}
                      />
                    </Localized>
                  )}
                </span>
              </span>
              {!verified && (
                <Localized id="se-unverified-2">
                  <span
                    data-testid="secondary-email-unverified-text"
                    className="uppercase block text-orange-600 font-bold text-xs"
                  >
                    unconfirmed
                  </span>
                </Localized>
              )}
            </p>
            {!verified && (
              <Localized
                id="se-resend-code-2"
                elems={{
                  button: (
                    <button
                      className="link-blue"
                      data-testid="secondary-email-resend-code-button"
                      onClick={() => {
                        resendEmailCode(email);
                      }}
                    />
                  ),
                }}
              >
                <p className="text-xs mt-3 text-grey-400">
                  Confirmation needed.{' '}
                  <button
                    className="link-blue"
                    data-testid="secondary-email-resend-code-button"
                    onClick={() => {
                      resendEmailCode(email);
                    }}
                  >
                    Resend confirmation code
                  </button>{' '}
                  if it's not in your inbox or spam folder.
                </p>
              </Localized>
            )}
          </div>
          <div
            className="unit-row-actions @mobileLandscape/unitRow:flex-1 @mobileLandscape/unitRow:flex @mobileLandscape/unitRow:justify-end "
            data-testid="secondary-email-unit-row-actions"
          >
            <div className="flex items-center -mt-1">
              {verified && (
                <Localized id="se-make-primary">
                  <button
                    disabled={account.loading}
                    className="cta-neutral cta-base-common cta-base-p disabled:cursor-wait whitespace-nowrap w-full @mobileLandscape/unitRow:w-auto @mobileLandscape/unitRow:text-xs @mobileLandscape/unitRow:py-1 @mobileLandscape/unitRow:px-5 @mobileLandscape/unitRow:mt-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingChangePrimary(email);
                    }}
                    data-testid="secondary-email-make-primary"
                  >
                    Make primary
                  </button>
                </Localized>
              )}
              <Localized id="se-remove-email" attrs={{ title: true }}>
                <ButtonIconTrash
                  title="Remove email"
                  classNames="hidden @mobileLandscape/unitRow:inline-block ms-1"
                  disabled={account.loading}
                  testId="secondary-email-delete"
                  onClick={() => {
                    setPendingSecondaryDelete(email);
                  }}
                />
              </Localized>
              {!verified && (
                <Localized id="se-refresh-email" attrs={{ title: true }}>
                  <ButtonIconReload
                    title="Refresh email"
                    classNames="hidden @mobileLandscape/unitRow:inline-block ms-1"
                    testId="secondary-email-refresh"
                    disabled={account.loading}
                    onClick={() => account.refresh('account')}
                  />
                </Localized>
              )}
            </div>
          </div>
        </div>
        {verified && isLastVerifiedSecondaryEmail && (
          <SecondaryEmailDefaultContent />
        )}
        {pendingChangePrimary && (
          <MfaGuard
            requiredScope="email"
            reason={MfaReason.changePrimaryEmail}
            onDismissCallback={async () => {
              setPendingChangePrimary(undefined);
            }}
          >
            <ChangePrimaryOnMount email={email} />
          </MfaGuard>
        )}
        {pendingSecondaryDelete && (
          <MfaGuard
            requiredScope="email"
            reason={MfaReason.removeSecondaryEmail}
            onDismissCallback={async () => {
              setPendingSecondaryDelete(undefined);
            }}
          >
            <DeleteEmailOnMount email={email} />
          </MfaGuard>
        )}
      </>
    );
  };

  if (!hasAtLeastOneSecondaryEmail) {
    return (
      <SecondaryEmailUtilities>
        <UnitRowSecondaryEmailNotSet />
      </SecondaryEmailUtilities>
    );
  }

  // user has at least one secondary email (verified or unverified) set
  return (
    <SecondaryEmailUtilities>
      <div className="unit-row @container/unitRow">
        <div className="font-header w-full mb-1 @mobileLandscape/unitRow:flex-none @mobileLandscape/unitRow:mb-0 @mobileLandscape/unitRow:mr-2 @mobileLandscape/unitRow:w-40">
          <Localized id="se-heading">
            <h3
              data-testid="secondary-email-unit-row-header"
              className="scroll-mt-32"
            >
              Secondary email
            </h3>
          </Localized>
        </div>
        <div className="@mobileLandscape/unitRow:flex-3 desktop:flex-5">
          {secondaryEmails.map((secondary, index) => (
            <UnitRowSecondaryEmailContentAndActions
              key={secondary.email}
              isLastVerifiedSecondaryEmail={
                index === lastVerifiedSecondaryEmailIndex
              }
              {...{
                secondary,
              }}
            />
          ))}
        </div>
      </div>
    </SecondaryEmailUtilities>
  );
};

const SecondaryEmailDefaultContent = () => (
  <div data-testid="secondary-email-default-content">
    <Localized id="se-default-content">
      <p className="text-sm mt-3">
        Access your account if you can’t log in to your primary email.
      </p>
    </Localized>
    <Localized
      id="se-content-note-1"
      elems={{
        a: (
          <a
            className="link-blue"
            href="#recovery-key"
            data-testid="secondary-email-link-recovery-key"
          >
            account recovery key
          </a>
        ),
      }}
    >
      <p className="text-grey-400 text-xs mt-2">
        Note: a secondary email won’t restore your information — you’ll need an{' '}
        <a
          className="link-blue"
          href="#recovery-key"
          data-testid="secondary-email-link-recovery-key"
        >
          account recovery key
        </a>{' '}
        for that.
      </p>
    </Localized>
  </div>
);

export default UnitRowSecondaryEmail;
