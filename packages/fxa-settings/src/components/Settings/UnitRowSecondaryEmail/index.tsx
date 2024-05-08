/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode, useCallback, useState } from 'react';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { useAccount, Email, useAlertBar } from '../../../models';
import UnitRow from '../UnitRow';
import ModalVerifySession from '../ModalVerifySession';
import { ButtonIconTrash, ButtonIconReload } from '../ButtonIcon';
import { Localized, useLocalization } from '@fluent/react';
import { HomePath } from '../../../constants';

type UnitRowSecondaryEmailContentAndActionsProps = {
  secondary: Email;
  isLastVerifiedSecondaryEmail: boolean;
};

export const UnitRowSecondaryEmail = () => {
  const account = useAccount();
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const [queuedAction, setQueuedAction] = useState<() => void>();
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
        navigate(`${HomePath}/emails/verify`, { state: { email } });
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
    [account, navigate, alertBar, l10n]
  );

  const makeEmailPrimary = useCallback(
    async (email: string) => {
      try {
        await account.makeEmailPrimary(email);
        alertBar.success(
          l10n.getString(
            'se-set-primary-successful-2',
            { email },
            `${email} is now your primary email`
          )
        );
      } catch (e) {
        alertBar.error(
          l10n.getString(
            'se-set-primary-error-2',
            null,
            'Sorry, there was a problem changing your primary email'
          )
        );
      }
    },
    [account, alertBar, l10n]
  );

  const deleteEmail = useCallback(
    async (email: string) => {
      try {
        await account.deleteSecondaryEmail(email);
        alertBar.success(
          l10n.getString(
            'se-delete-email-successful-2',
            { email },
            `${email} successfully deleted`
          )
        );
      } catch (e) {
        alertBar.error(
          l10n.getString(
            'se-delete-email-error-2',
            null,
            `Sorry, there was a problem deleting this email`
          )
        );
      }
    },
    [account, alertBar, l10n]
  );

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
        headerValue={null}
        route={`${HomePath}/emails`}
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
    const queueEmailAction = (action: () => void) => {
      setQueuedAction(() => {
        return () => {
          setQueuedAction(undefined);
          action();
        };
      });
    };

    return (
      <>
        <div className="mobileLandscape:flex unit-row-multi-row">
          <div
            className="unit-row-content"
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
                      classNames="mobileLandscape:hidden ltr:ml-1 rtl:mr-1"
                      disabled={account.loading}
                      onClick={() => {
                        queueEmailAction(() => deleteEmail(email));
                      }}
                    />
                  </Localized>
                  {!verified && (
                    <Localized id="se-refresh-email" attrs={{ title: true }}>
                      <ButtonIconReload
                        title="Refresh email"
                        classNames="mobileLandscape:hidden ltr:ml-1 rtl:mr-1"
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
            className="unit-row-actions"
            data-testid="secondary-email-unit-row-actions"
          >
            <div className="flex items-center -mt-1">
              {verified && (
                <Localized id="se-make-primary">
                  <button
                    disabled={account.loading}
                    className="cta-neutral cta-base cta-base-p disabled:cursor-wait whitespace-nowrap"
                    onClick={() => {
                      queueEmailAction(() => makeEmailPrimary(email));
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
                  classNames="hidden mobileLandscape:inline-block ltr:ml-1 rtl:mr-1"
                  disabled={account.loading}
                  testId="secondary-email-delete"
                  onClick={() => {
                    queueEmailAction(() => deleteEmail(email));
                  }}
                />
              </Localized>
              {!verified && (
                <Localized id="se-refresh-email" attrs={{ title: true }}>
                  <ButtonIconReload
                    title="Refresh email"
                    classNames="hidden mobileLandscape:inline-block ltr:ml-1 rtl:mr-1"
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
      <div className="unit-row">
        <div className="font-header w-full mb-1 mobileLandscape:flex-none mobileLandscape:mb-0 mobileLandscape:mr-2 mobileLandscape:w-40">
          <Localized id="se-heading">
            <h3
              data-testid="secondary-email-unit-row-header"
              className="scroll-mt-32"
            >
              Secondary email
            </h3>
          </Localized>
        </div>
        <div className="mobileLandscape:flex-3 desktop:flex-5">
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
