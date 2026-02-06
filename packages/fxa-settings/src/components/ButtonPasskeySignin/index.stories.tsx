/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ButtonPasskeySignin from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';

export default {
  title: 'components/ButtonPasskeySignin',
  component: ButtonPasskeySignin,
  decorators: [withLocalization],
} as Meta;

export const Default = () => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = () => {
    action('clicked')();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="card mx-auto">
      <ButtonPasskeySignin loading={loading} onClick={handleClick} />
    </div>
  );
};

export const Loading = () => (
  <div className="card mx-auto">
    <ButtonPasskeySignin loading={true} onClick={action('clicked')} />
  </div>
);
