import React from 'react';
import { storiesOf } from '@storybook/react';
import { TermsAndPrivacy } from './index';
import { SELECTED_PLAN } from '../../lib/mock-data';
import MockApp from '../../../.storybook/components/MockApp';

storiesOf('components/TermsAndPrivacy', module)
  .add('default locale', () => <TermsAndPrivacy plan={SELECTED_PLAN} />)
  .add('with fr locale', () => (
    <MockApp languages={['fr']}>
      <TermsAndPrivacy plan={SELECTED_PLAN} />
    </MockApp>
  ));
