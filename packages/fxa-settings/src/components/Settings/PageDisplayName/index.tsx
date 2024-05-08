/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { RouteComponentProps } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { useForm } from 'react-hook-form';
import FlowContainer from '../FlowContainer';
import InputText from '../../InputText';
import { HomePath } from '../../../constants';
import { Localized, useLocalization } from '@fluent/react';
import { useAccount, useAlertBar } from '../../../models';

const validateDisplayName =
  (currentDisplayName: string) => (newDisplayName: string) =>
    newDisplayName !== currentDisplayName && newDisplayName.length <= 256;

export const PageDisplayName = (_: RouteComponentProps) => {
  const account = useAccount();
  const alertBar = useAlertBar();
  const { l10n } = useLocalization();
  const navigate = useNavigate();
  const goHome = () => navigate(HomePath, { replace: true });
  const alertSuccessAndGoHome = useCallback(() => {
    alertBar.success(
      l10n.getString(
        'display-name-success-alert-2',
        null,
        'Display name updated'
      )
    );
    navigate(HomePath, { replace: true });
  }, [alertBar, l10n, navigate]);
  const initialValue = account.displayName || '';
  const { register, handleSubmit, formState, trigger } = useForm<{
    displayName: string;
  }>({
    mode: 'onTouched',
    defaultValues: {
      displayName: initialValue,
    },
  });
  const isValidDisplayName = validateDisplayName(initialValue);

  const onSubmit = useCallback(
    async ({ displayName }: { displayName: string }) => {
      try {
        await account.setDisplayName(displayName);
        alertSuccessAndGoHome();
      } catch (err) {
        alertBar.error(
          l10n.getString(
            'display-name-update-error-2',
            null,
            'There was a problem updating your display name'
          )
        );
      }
    },
    [account, alertSuccessAndGoHome, l10n, alertBar]
  );

  return (
    <Localized id="display-name-page-title" attrs={{ title: true }}>
      <FlowContainer title="Display name">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="my-6">
            <Localized id="display-name-input" attrs={{ label: true }}>
              <InputText
                name="displayName"
                label="Enter display name"
                className="mb-2"
                data-testid="display-name-input"
                autoFocus
                onChange={() => trigger('displayName')}
                inputRef={register({
                  validate: isValidDisplayName,
                })}
              />
            </Localized>
          </div>
          <div className="flex justify-center mb-4 mx-auto max-w-64">
            <Localized id="cancel-display-name">
              <button
                type="button"
                data-testid="cancel-display-name"
                className="cta-neutral cta-base-p mx-2 flex-1"
                onClick={goHome}
              >
                Cancel
              </button>
            </Localized>
            <Localized id="submit-display-name">
              <button
                type="submit"
                data-testid="submit-display-name"
                className="cta-primary cta-base-p mx-2 flex-1"
                disabled={
                  !formState.isDirty || !formState.isValid || account.loading
                }
              >
                Save
              </button>
            </Localized>
          </div>
        </form>
      </FlowContainer>
    </Localized>
  );
};

export default PageDisplayName;
