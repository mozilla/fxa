import { PriceDetails } from '.';

import '@testing-library/jest-dom/extend-expect';
import { renderWithLocalizationProvider } from '../../lib/test-utils';

const defaultPriceDetailsProps = {
  total: 2000,
  currency: 'USD',
};

describe('PriceDetails', () => {
  describe('PriceDetails component', () => {
    it('renders NoInterval component', () => {
      const subject = () => {
        return renderWithLocalizationProvider(
          <PriceDetails {...defaultPriceDetailsProps} />
        );
      };

      const { queryByTestId } = subject();
      expect(queryByTestId('price-details-no-tax')).toBeInTheDocument();
    });

    it('renders Interval component', () => {
      const subject = () => {
        return renderWithLocalizationProvider(
          <PriceDetails
            {...defaultPriceDetailsProps}
            interval={'month'}
            intervalCount={2}
          />
        );
      };

      const { queryByTestId } = subject();
      expect(
        queryByTestId('price-details-no-tax-interval')
      ).toBeInTheDocument();
    });
  });

  describe('NoInterval', () => {
    it('renders without tax', () => {
      const subject = () => {
        return renderWithLocalizationProvider(
          <PriceDetails {...defaultPriceDetailsProps} />
        );
      };

      const { queryByTestId } = subject();
      expect(queryByTestId('price-details-no-tax')).toBeInTheDocument();
      expect(queryByTestId('price-details-no-tax')).toHaveTextContent('$20.00');
    });

    it('renders with tax with showTax set', () => {
      const subject = () => {
        return renderWithLocalizationProvider(
          <PriceDetails
            {...defaultPriceDetailsProps}
            tax={300}
            showTax={true}
          />
        );
      };

      const { queryByTestId } = subject();
      expect(queryByTestId('price-details-tax')).toBeInTheDocument();
      expect(queryByTestId('price-details-tax')).toHaveTextContent(
        '$20.00 + $3.00 tax'
      );
    });

    it('renders with tax without showTax set', () => {
      const subject = () => {
        return renderWithLocalizationProvider(
          <PriceDetails {...defaultPriceDetailsProps} tax={300} />
        );
      };

      const { queryByTestId } = subject();
      expect(queryByTestId('price-details-tax')).toBeInTheDocument();
      expect(queryByTestId('price-details-tax')).toHaveTextContent(
        '$20.00 + $3.00 tax'
      );
    });

    it('renders with tax, even though tax isnt provided', () => {
      const subject = () => {
        return renderWithLocalizationProvider(
          <PriceDetails {...defaultPriceDetailsProps} showTax={true} />
        );
      };

      const { queryByTestId } = subject();
      expect(queryByTestId('price-details-tax')).toBeInTheDocument();
      expect(queryByTestId('price-details-tax')).toHaveTextContent(
        '$20.00 + $0.00 tax'
      );
    });
  });

  describe('Interval', () => {
    describe('Without tax', () => {
      it('renders for one day', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'day'}
              intervalCount={1}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-no-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 daily');
      });

      it('renders for multiple days', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'day'}
              intervalCount={2}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-no-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 every 2 days');
      });

      it('renders for one week', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'week'}
              intervalCount={1}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-no-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 weekly');
      });

      it('renders for multiple weeks', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'week'}
              intervalCount={2}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-no-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 every 2 weeks');
      });

      it('renders for one month', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'month'}
              intervalCount={1}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-no-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 monthly');
      });

      it('renders for multiple months', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'month'}
              intervalCount={2}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-no-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 every 2 months');
      });

      it('renders for one year', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'year'}
              intervalCount={1}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-no-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 yearly');
      });

      it('renders for multiple years', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'year'}
              intervalCount={2}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-no-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 every 2 years');
      });
    });

    describe('With tax', () => {
      it('renders for one day', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'day'}
              intervalCount={1}
              tax={300}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 + $3.00 tax daily');
      });

      it('renders for multiple days', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'day'}
              intervalCount={2}
              tax={300}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent(
          '$20.00 + $3.00 tax every 2 days'
        );
      });

      it('renders for one week', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'week'}
              intervalCount={1}
              tax={300}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 + $3.00 tax weekly');
      });

      it('renders for multiple weeks', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'week'}
              intervalCount={2}
              tax={300}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent(
          '$20.00 + $3.00 tax every 2 weeks'
        );
      });

      it('renders for one month', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'month'}
              intervalCount={1}
              tax={300}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 + $3.00 tax monthly');
      });

      it('renders for multiple months', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'month'}
              intervalCount={2}
              tax={300}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent(
          '$20.00 + $3.00 tax every 2 months'
        );
      });

      it('renders for one year', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'year'}
              intervalCount={1}
              tax={300}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent('$20.00 + $3.00 tax yearly');
      });

      it('renders for multiple years', () => {
        const subject = () => {
          return renderWithLocalizationProvider(
            <PriceDetails
              {...defaultPriceDetailsProps}
              interval={'year'}
              intervalCount={2}
              tax={300}
            />
          );
        };

        const { queryByTestId } = subject();
        const intervalText = queryByTestId('price-details-tax-interval');
        expect(intervalText).toBeInTheDocument();
        expect(intervalText).toHaveTextContent(
          '$20.00 + $3.00 tax every 2 years'
        );
      });
    });
  });
});
