/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from '@reach/router';
import { Localized, useLocalization } from '@fluent/react';

import { HomePath } from '../../constants';
import { useAccount } from '../../models';
import { useAlertBar } from '../../lib/hooks';
import firefox from '../../lib/firefox';
import ButtonIcon from '../ButtonIcon';
import { buttonClass } from './buttons';

import { ReactComponent as RemoveIcon } from './remove.svg';

export const DELETE_AVATAR_MUTATION = gql`
  mutation deleteAvatar($input: DeleteAvatarInput!) {
    deleteAvatar(input: $input) {
      clientMutationId
      avatarUrl
    }
  }
`;

export const RemovePhotoBtn = () => {
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const account = useAccount();
  const { avatarId } = account;
  const { l10n } = useLocalization();

  const [deleteAvatar] = useMutation(DELETE_AVATAR_MUTATION, {
    onCompleted: () => {
      firefox.profileChanged(account.uid);
      navigate(HomePath, { replace: true });
    },
    onError: () => {
      alertBar.error(l10n.getString('avatar-page-delete-error'));
    },
    update: (cache) => {
      cache.modify({
        id: cache.identify({ __typename: 'Account' }),
        fields: {
          avatarUrl() {
            return null;
          },
        },
      });
    },
  });

  return (
    <div
      onClick={() => {
        deleteAvatar({ variables: { input: { id: avatarId } } });
      }}
      className="cursor-pointer flex-1"
    >
      <Localized id="avatar-page-remove-photo-button" attrs={{ title: true }}>
        <ButtonIcon
          testId="remove-photo-btn"
          title="Remove photo"
          icon={[RemoveIcon, 24, 22]}
          classNames={buttonClass}
        />
      </Localized>
      <Localized id="avatar-page-remove-photo">
        <p>Remove photo</p>
      </Localized>
    </div>
  );
};
