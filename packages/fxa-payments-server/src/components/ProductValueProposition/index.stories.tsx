import React from 'react';
import { storiesOf } from '@storybook/react';
import { MockLoader } from '../../../.storybook/components/MockLoader';
import { ProductValueProposition } from './index';

function init() {
  storiesOf('components/ProductValueProposition', module)
  .add('default', () => (
    <MockLoader>
      <ProductValueProposition plan={mockPlan} />
    </MockLoader>
  ))
  .add('123doneProProduct', () => (
    <MockLoader>
      <ProductValueProposition plan={{ ...mockPlan, product_id: '123doneProProduct' }} />
    </MockLoader>
  ))
  .add('321doneProProduct', () => (
    <MockLoader>
      <ProductValueProposition plan={{ ...mockPlan, product_id: '321doneProProduct' }} />
    </MockLoader>
  ));
}

const PRODUCT_ID = 'product_8675309';

const mockPlan = {
  plan_id: 'plan_123',
  plan_name: 'Example Plan',
  product_id: PRODUCT_ID,
  product_name: 'Example Product',
  currency: 'USD',
  amount: 1099,
  interval: 'month'  
};

init();