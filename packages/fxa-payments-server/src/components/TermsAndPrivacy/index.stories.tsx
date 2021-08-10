import React from 'react';
import { storiesOf } from '@storybook/react';
import { TermsAndPrivacy } from './index';
import { SELECTED_PLAN } from '../../lib/mock-data';
import MockApp from '../../../.storybook/components/MockApp';

storiesOf('components/TermsAndPrivacy', module)
  .add('default locale', () => (
    <MockApp languages={[]}>
      <TermsAndPrivacy plan={SELECTED_PLAN} />
    </MockApp>
  ))
  .add('default locale with fxa links', () => (
    <MockApp languages={[]}>
      <TermsAndPrivacy plan={SELECTED_PLAN} showFXALinks={true} />
    </MockApp>
  ))
  .add('with fr locale', () => (
    <MockApp languages={['fr']}>
      <TermsAndPrivacy plan={SELECTED_PLAN} />
    </MockApp>
  ))
  .add('with fr locale and fxa links', () => (
    <MockApp languages={['fr']}>
      <TermsAndPrivacy plan={SELECTED_PLAN} showFXALinks={true} />
    </MockApp>
  ));
