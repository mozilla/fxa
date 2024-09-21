/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState, ChangeEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { useAccount, useAlertBar } from '../../../models';
import InputPassword from '../../InputPassword';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { LINK, SETTINGS_PATH } from '../../../constants';
import { logViewEvent, usePageViewEvent } from '../../../lib/metrics';
import { Checkbox } from '../Checkbox';
import { useLocalization } from '@fluent/react';
import { Localized } from '@fluent/react';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { hardNavigate } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import GleanMetrics from '../../../lib/glean';
import { useFtlMsgResolver } from '../../../models/hooks';

type FormData = {
  password: string;
};

const checkboxLabels: Record<string, string> = {
  'delete-account-chk-box-1-v3':
    'Any paid subscriptions you have will be canceled (Except Pocket)',
  'delete-account-chk-box-2':
    'You may lose saved information and features within Mozilla products',
  'delete-account-chk-box-3':
    'Reactivating with this email may not restore your saved information',
  'delete-account-chk-box-4':
    'Any extensions and themes that you published to addons.mozilla.org will be deleted',
};

const deleteProducts = [
  {
    localizationId: 'delete-account-product-firefox-sync',
    productName: 'Syncing Firefox data',
    href: LINK.FX_SYNC,
  },
  {
    localizationId: 'delete-account-product-mozilla-vpn',
    productName: 'Mozilla VPN',
    href: LINK.VPN,
  },
  {
    localizationId: 'delete-account-product-firefox-relay',
    productName: 'Firefox Relay',
    href: LINK.RELAY,
  },
  {
    localizationId: 'delete-account-product-firefox-addons',
    productName: 'Firefox Add-ons',
    href: LINK.AMO,
  },
  {
    localizationId: 'delete-account-product-mozilla-monitor',
    productName: 'Mozilla Monitor',
    href: LINK.MONITOR,
  },
  {
    localizationId: 'delete-account-product-mdn-plus',
    productName: 'MDN Plus',
    href: LINK.MDN,
  },
  {
    localizationId: 'delete-account-product-mozilla-hubs',
    productName: 'Mozilla Hubs',
    href: LINK.HUBS,
  },
  {
    localizationId: 'delete-account-product-pocket',
    productName: 'Pocket',
    href: LINK.POCKET,
  },
];

export const PageDeleteAccount = (_: RouteComponentProps) => {
  usePageViewEvent('settings.delete-account');
  const { l10n } = useLocalization();
  const { handleSubmit, register, formState, setValue } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      password: '',
    },
  });
  // TODO: the `.errors.password` clause shouldn't be necessary, but `isValid` isn't updating
  // properly. I think this is a bug in react-hook-form.
  const disabled =
    !formState.isDirty || !formState.isValid || !!formState.errors.password;
  const [errorText, setErrorText] = useState<string>();
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [subtitleText, setSubtitleText] = useState<string>(
    l10n.getString('delete-account-step-1-2', null, 'Step 1 of 2')
  );
  const [hasEngagedWithForm, setHasEngagedWithForm] = useState(false);
  const [checkedBoxes, setCheckedBoxes] = useState<string[]>([]);
  const allBoxesChecked = Object.keys(checkboxLabels).every((element) =>
    checkedBoxes.includes(element)
  );
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();
  const goHome = useCallback(() => window.history.back(), []);

  const account = useAccount();

  useEffect(() => {
    GleanMetrics.deleteAccount.view();
  }, []);

  useEffect(() => {
    if (!account.hasPassword) {
      setSubtitleText('');
    }
  }, [account.hasPassword]);

  const advanceStep = () => {
    GleanMetrics.deleteAccount.submit();
    // Accounts that do not have a password set, will delete immediately
    if (!account.hasPassword) {
      deleteAccount('');
    } else {
      setSubtitleText(
        l10n.getString('delete-account-step-2-2', null, 'Step 2 of 2')
      );
      setConfirmed(true);
      GleanMetrics.deleteAccount.passwordView();
      logViewEvent('flow.settings.account-delete', 'terms-checked.success');
    }
  };

  const deleteAccount = useCallback(
    async (password: string) => {
      try {
        await account.destroy(password);
        logViewEvent(
          'flow.settings.account-delete',
          'confirm-password.success'
        );
        hardNavigate('/', { delete_account_success: true }, true);
      } catch (e) {
        const localizedError = getLocalizedErrorMessage(ftlMsgResolver, e);
        if (e.errno === AuthUiErrors.INCORRECT_PASSWORD.errno) {
          setErrorText(localizedError);
          setValue('password', '');
        } else {
          alertBar.error(localizedError);
          logViewEvent('flow.settings.account-delete', 'confirm-password.fail');
        }
      }
    },
    [account, setErrorText, setValue, alertBar, ftlMsgResolver]
  );

  const handleConfirmChange =
    (labelText: string) => (event: ChangeEvent<HTMLInputElement>) => {
      event.persist();
      setCheckedBoxes((existing) => {
        if (event.target.checked) {
          if (!hasEngagedWithForm) {
            GleanMetrics.deleteAccount.engage();
            setHasEngagedWithForm(true);
          }
          return [...existing, labelText];
        } else {
          return [...existing.filter((text) => text !== labelText)];
        }
      });
    };

  const onFormSubmit = ({ password }: FormData) => {
    deleteAccount(password);
  };

  return (
    <Localized id="delete-account-header" attrs={{ title: true }}>
      <FlowContainer title="Delete account" subtitle={subtitleText}>
        <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
        {!confirmed && (
          <div className="my-4 text-sm" data-testid="delete-account-confirm">
            <Localized id="delete-account-confirm-title-4">
              <p className="mb-4">
                You may have connected your Mozilla account to one or more of
                the following Mozilla products or services that keep you secure
                and productive on the web:
              </p>
            </Localized>
            <ul
              className="list-inside my-2 mb-4"
              data-testid="delete-account-product-list"
            >
              {deleteProducts.map((product) => (
                <li className="list-disc mt-1" key={product.localizationId}>
                  <a className="link-blue" href={product.href}>
                    <Localized id={product.localizationId}>
                      {product.productName}
                    </Localized>
                  </a>
                </li>
              ))}
            </ul>

            <Localized
              id="pocket-delete-notice"
              elems={{
                a: (
                  <LinkExternal
                    href="https://help.getpocket.com/article/986-canceling-your-pocket-premium-subscription"
                    data-testid="link-pocket-delete-notice"
                    className="link-blue"
                  >
                    cancel your subscription
                  </LinkExternal>
                ),
              }}
            >
              <p className="mb-4">
                If you subscribe to Pocket Premium, please make sure that you{' '}
                <a href="#todo-change-to-button">cancel your subscription</a>{' '}
                before deleting your account.
              </p>
            </Localized>
            <Localized
              id="pocket-delete-notice-marketing"
              elems={{
                a: (
                  <LinkExternal
                    href="https://privacyportal.onetrust.com/webform/1350748f-7139-405c-8188-22740b3b5587/4ba08202-2ede-4934-a89e-f0b0870f95f0"
                    data-testid="link-marketing-delete-notice"
                    className="link-blue"
                  >
                    request deletion of your marketing data.
                  </LinkExternal>
                ),
              }}
            >
              <p className="mb-4">
                To stop receiving marketing emails from Mozilla Corporation and
                Mozilla Foundation, you must{' '}
                <a href="#todo-change-to-button">
                  request deletion of your marketing data.
                </a>{' '}
              </p>
            </Localized>
            <Localized id="delete-account-acknowledge">
              <p className="mb-4">
                Please acknowledge that by deleting your account:
              </p>
            </Localized>
            <form>
              <ul className="mt-4 text-xs">
                {Object.keys(checkboxLabels).map((label, i) => (
                  <li className="py-2" key={i}>
                    <Localized id={label} attrs={{ label: true }}>
                      <Checkbox
                        data-testid="required-confirm"
                        label={l10n.getString(
                          label,
                          null,
                          checkboxLabels[label]
                        )}
                        onChange={handleConfirmChange(label)}
                      />
                    </Localized>
                  </li>
                ))}
              </ul>
            </form>
            <div className="mt-4 flex items-center justify-center">
              <Localized id="delete-account-cancel-button">
                <button
                  className="cta-neutral mx-2 px-10 py-2"
                  onClick={() =>
                    navigate(SETTINGS_PATH + '#delete-account', {
                      replace: true,
                    })
                  }
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
              </Localized>
              <Localized id="delete-account-continue-button">
                <button
                  className="cta-primary mx-2 px-10 py-2"
                  disabled={!allBoxesChecked}
                  onClick={() => advanceStep()}
                  data-testid="continue-button"
                >
                  Continue
                </button>
              </Localized>
            </div>
          </div>
        )}
        {confirmed && (
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="mt-4 mb-6" data-testid="delete-account-input">
              <Localized
                id="delete-account-password-input"
                attrs={{ label: true }}
              >
                <InputPassword
                  name="password"
                  label="Enter password"
                  prefixDataTestId="delete-account-confirm"
                  onChange={() => {
                    if (errorText) {
                      setErrorText(undefined);
                    }
                  }}
                  inputRef={register({
                    required: true,
                    minLength: 8,
                  })}
                  {...{ errorText }}
                />
              </Localized>
            </div>

            <div className="flex items-center justify-center">
              <Localized id="delete-account-cancel-button">
                <button
                  type="button"
                  className="cta-neutral py-2 mx-2 px-4 tablet:px-10"
                  data-testid="cancel-button"
                  onClick={goHome}
                >
                  Cancel
                </button>
              </Localized>
              <Localized id="delete-account-delete-button-2">
                <button
                  type="submit"
                  className="cta-caution py-2 mx-2 px-4 tablet:px-10"
                  data-testid="delete-account-button"
                  disabled={disabled}
                  onClick={() => {
                    GleanMetrics.deleteAccount.passwordSubmit();
                  }}
                >
                  Delete
                </button>
              </Localized>
            </div>
          </form>
        )}
      </FlowContainer>
    </Localized>
  );
};

export default PageDeleteAccount;
