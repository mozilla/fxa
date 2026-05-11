/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('@radix-ui/react-form');

jest.mock('@fluent/react', () => ({
  __esModule: true,
  Localized: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, className }: { alt?: string; className?: string }) => (
    <img alt={alt ?? ''} className={className} src="mock-image" />
  ),
}));

const mockRouterPush = jest.fn();

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('i18n-iso-countries', () => ({
  __esModule: true,
  default: {
    registerLocale: jest.fn(),
    getNames: () => ({
      US: 'United States',
      CA: 'Canada',
      DE: 'Germany',
      GB: 'United Kingdom',
      IR: 'Iran',
    }),
  },
  registerLocale: jest.fn(),
  getNames: () => ({
    US: 'United States',
    CA: 'Canada',
    DE: 'Germany',
    GB: 'United Kingdom',
    IR: 'Iran',
  }),
}));

const mockValidateAndFormatPostalCode = jest.fn();

jest.mock('@fxa/payments/ui/actions', () => ({
  __esModule: true,
  validateAndFormatPostalCode: (...args: unknown[]) =>
    mockValidateAndFormatPostalCode(...args),
}));

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  ButtonVariant: { Primary: 'primary', Secondary: 'secondary' },
  BaseButton: ({
    children,
    className,
    disabled,
    onClick,
    type = 'button',
    'data-testid': testId,
    'aria-disabled': ariaDisabled,
  }: {
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'submit' | 'button' | 'reset';
    'data-testid'?: string;
    'aria-disabled'?: boolean;
  }) => (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
      aria-disabled={ariaDisabled}
    >
      {children}
    </button>
  ),
  SubmitButton: ({
    children,
    className,
    'data-testid': testId,
  }: {
    children: React.ReactNode;
    className?: string;
    'data-testid'?: string;
  }) => (
    <button type="submit" className={className} data-testid={testId}>
      {children}
    </button>
  ),
}));

import { SelectTaxLocation } from './index';

const baseSaveAction = jest.fn();

const baseProps = {
  saveAction: (...args: unknown[]) => baseSaveAction(...args),
  cmsCountries: ['US', 'CA', 'DE'],
  locale: 'en',
  productName: 'Mozilla VPN',
  unsupportedLocations: 'IR',
  countryCode: undefined,
  postalCode: undefined,
  currentCurrency: 'usd',
  showNewTaxRateInfoMessage: false,
};

describe('SelectTaxLocation', () => {
  beforeEach(() => {
    mockRouterPush.mockReset();
    mockValidateAndFormatPostalCode.mockReset();
    baseSaveAction.mockReset();
  });

  describe('Expanded/collapsed toggle', () => {
    it('starts collapsed when an existing location is provided, expands on edit, and collapses on cancel', async () => {
      render(
        <SelectTaxLocation
          {...baseProps}
          countryCode="US"
          postalCode="94107"
        />
      );

      expect(screen.getByTestId('tax-location-haslocation')).toBeInTheDocument();
      expect(screen.getByText('US, 94107')).toBeInTheDocument();
      expect(
        screen.queryByTestId('select-location-form')
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('tax-location-edit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('select-location-form')).toBeInTheDocument();
      });
      expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
      expect(screen.getByTestId('postal-code')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('tax-location-cancel-button'));

      expect(screen.getByTestId('tax-location-haslocation')).toBeInTheDocument();
      expect(
        screen.queryByTestId('select-location-form')
      ).not.toBeInTheDocument();
    });
  });

  describe('Successful save', () => {
    it('calls saveAction, collapses to the updated location, and shows the success alert', async () => {
      mockValidateAndFormatPostalCode.mockResolvedValue({
        isValid: true,
        formattedPostalCode: 'A1B 2C3',
      });
      baseSaveAction.mockResolvedValue({
        ok: true,
        data: { countryCode: 'CA', postalCode: 'A1B 2C3' },
      });

      render(<SelectTaxLocation {...baseProps} />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Country/i), {
        target: { value: 'CA' },
      });
      fireEvent.change(screen.getByTestId('postal-code'), {
        target: { value: 'a1b2c3' },
      });

      fireEvent.submit(screen.getByTestId('select-location-form'));

      await waitFor(() => {
        expect(baseSaveAction).toHaveBeenCalledWith('CA', 'A1B 2C3');
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('tax-location-haslocation')
        ).toBeInTheDocument();
      });
      expect(screen.getByText('CA, A1B 2C3')).toBeInTheDocument();
      expect(
        screen.getByText(/Your location has been updated/i)
      ).toBeInTheDocument();
    });
  });

  describe('Validation and error states', () => {
    it('flips into the missing-country error state when the country select dispatches an invalid event with no value', async () => {
      render(<SelectTaxLocation {...baseProps} />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument();
      });

      fireEvent.invalid(screen.getByLabelText(/Country/i));

      expect(
        screen.getByText(/Please select your country/i)
      ).toBeInTheDocument();
    });

    it('shows the product-not-available error when a country outside cmsCountryCodes is selected', async () => {
      render(<SelectTaxLocation {...baseProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'United Kingdom' })
        ).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Country/i), {
        target: { value: 'GB' },
      });

      expect(
        screen.getByText(/Mozilla VPN is not available in this location/i)
      ).toBeInTheDocument();
    });

    it('shows the unsupported-country error when a sanctioned country is selected', async () => {
      render(<SelectTaxLocation {...baseProps} />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Iran' })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Country/i), {
        target: { value: 'IR' },
      });

      expect(
        screen.getByText(/not supported according to our Terms of Service/i)
      ).toBeInTheDocument();
    });

    it('shows the invalid-postal-code error when validation fails', async () => {
      mockValidateAndFormatPostalCode.mockResolvedValue({ isValid: false });

      render(<SelectTaxLocation {...baseProps} />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Country/i), {
        target: { value: 'CA' },
      });
      fireEvent.change(screen.getByTestId('postal-code'), {
        target: { value: '!!bad!!' },
      });
      fireEvent.submit(screen.getByTestId('select-location-form'));

      await waitFor(() => {
        expect(
          screen.getByText(/Please enter a valid postal code/i)
        ).toBeInTheDocument();
      });
      expect(baseSaveAction).not.toHaveBeenCalled();
    });

    it('shows the invalid-currency-change error when saveAction returns a currency_change error', async () => {
      mockValidateAndFormatPostalCode.mockResolvedValue({
        isValid: true,
        formattedPostalCode: '10115',
      });
      baseSaveAction.mockResolvedValue({
        ok: false,
        error: 'currency_change',
      });

      render(<SelectTaxLocation {...baseProps} />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Germany' })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Country/i), {
        target: { value: 'DE' },
      });
      fireEvent.change(screen.getByTestId('postal-code'), {
        target: { value: '10115' },
      });
      fireEvent.submit(screen.getByTestId('select-location-form'));

      await waitFor(() => {
        expect(
          screen.getByText(/Select a country that uses the/i)
        ).toBeInTheDocument();
      });
    });

    it('shows the location-not-updated error and keeps the form interactive when saveAction throws', async () => {
      mockValidateAndFormatPostalCode.mockResolvedValue({
        isValid: true,
        formattedPostalCode: '94107',
      });
      baseSaveAction.mockRejectedValue(new Error('network down'));

      render(<SelectTaxLocation {...baseProps} />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Country/i), {
        target: { value: 'CA' },
      });
      fireEvent.change(screen.getByTestId('postal-code'), {
        target: { value: 'A1B 2C3' },
      });
      fireEvent.submit(screen.getByTestId('select-location-form'));

      await waitFor(() => {
        expect(
          screen.getByText(/Your location could not be updated/i)
        ).toBeInTheDocument();
      });

      expect(screen.getByTestId('tax-location-save-button')).not.toBeDisabled();
      expect(screen.getByLabelText(/Country/i)).not.toBeDisabled();
      expect(screen.getByTestId('postal-code')).not.toBeDisabled();
    });
  });
});
