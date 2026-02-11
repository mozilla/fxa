import React from 'react';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import SubscriptionTitle, { SubscriptionTitleProps, titles } from './index';

import {
  getLocalizedMessage,
  renderWithLocalizationProvider,
} from '../../lib/test-utils';
import { getFtlBundle } from 'fxa-react/lib/test-utils';
import { FluentBundle } from '@fluent/bundle';

const defaultProps: SubscriptionTitleProps = {
  screenType: 'create',
};

afterEach(cleanup);

describe('SubscriptionTitle', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('payments');
  });
  it('renders as expected', async () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <SubscriptionTitle {...defaultProps} />
      );
    };
    const { findByTestId } = subject();
    const component = await findByTestId('subscription-create-title');

    const expectedTitle = 'Set up your subscription';
    expect(component).toHaveTextContent(expectedTitle);
    const actualTitle = getLocalizedMessage(
      bundle,
      'subscription-create-title',
      {}
    );
    expect(actualTitle).toEqual(expectedTitle);

    const expectedSubtitle = '30-day money-back guarantee';
    expect(component).toHaveTextContent(expectedSubtitle);
    const actualSubtitle = getLocalizedMessage(bundle, 'sub-guarantee', {});
    expect(actualSubtitle).toEqual(expectedSubtitle);
  });

  it('renders as expected for SubscriptionSuccess', async () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <SubscriptionTitle screenType="success" />
      );
    };
    const { findByTestId } = subject();
    const component = await findByTestId('subscription-success-title');

    const expectedTitle = 'Subscription confirmation';
    expect(component).toHaveTextContent(expectedTitle);
    const actualTitle = getLocalizedMessage(
      bundle,
      'subscription-success-title',
      {}
    );
    expect(actualTitle).toEqual(expectedTitle);

    const expectedSubtitle = '30-day money-back guarantee';
    expect(component).toHaveTextContent(expectedSubtitle);
    const actualSubtitle = getLocalizedMessage(bundle, 'sub-guarantee', {});
    expect(actualSubtitle).toEqual(expectedSubtitle);
  });

  it('renders as expected for PaymentProcessing', async () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <SubscriptionTitle screenType="processing" />
      );
    };
    const { findByTestId } = subject();
    const component = await findByTestId('subscription-processing-title');

    const expectedTitle = 'Confirming subscription…';
    expect(component).toHaveTextContent(expectedTitle);
    const actualTitle = getLocalizedMessage(
      bundle,
      'subscription-processing-title',
      {}
    );
    expect(actualTitle).toEqual(expectedTitle);

    const expectedSubtitle = '30-day money-back guarantee';
    expect(component).toHaveTextContent(expectedSubtitle);
    const actualSubtitle = getLocalizedMessage(bundle, 'sub-guarantee', {});
    expect(actualSubtitle).toEqual(expectedSubtitle);
  });

  it('renders the subtitle as expected', async () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <SubscriptionTitle
          {...{
            screenType: 'noplanchange',
            subtitle: <p>{titles.noplanchange}</p>,
          }}
        />
      );
    };
    const { findByTestId } = subject();
    const component = await findByTestId('subscription-noplanchange-title');

    const expectedTitle = titles.noplanchange;
    expect(component).toHaveTextContent(expectedTitle);
    const actualTitle = getLocalizedMessage(
      bundle,
      'subscription-noplanchange-title',
      {}
    );
    expect(actualTitle).toEqual(expectedTitle);

    const defaultSubtitle = '30-day money-back guarantee';
    expect(component).not.toHaveTextContent(defaultSubtitle);
    expect(component).toHaveTextContent(titles.noplanchange);
  });
});
