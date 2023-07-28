import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '.';

describe('Footer', () => {
  it('renders the footer', () => {
    render(<Footer />);

    const globalFooter = screen.getByTestId('footer');

    expect(globalFooter).toBeVisible();
  });
});
