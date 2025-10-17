import { BlockStatus } from '.';
import { render, screen } from '@testing-library/react';
import { mockBlockStatusData1 } from '../mocks';

describe('BlockStatus', () => {
  it('renders correctly', () => {
    render(<BlockStatus status={mockBlockStatusData1} />);

    expect(screen.getByText('Action:')).toBeInTheDocument();
    expect(screen.getByText('login')).toBeInTheDocument();

    expect(screen.getByText('Policy:')).toBeInTheDocument();
    expect(screen.getByText('block')).toBeInTheDocument();

    expect(screen.getByText('Reason:')).toBeInTheDocument();
    expect(screen.getByText('Too many requests')).toBeInTheDocument();

    expect(screen.getByText('Blocking On:')).toBeInTheDocument();
    expect(screen.getByText('IP + Email')).toBeInTheDocument();

    expect(screen.getByText('Duration:')).toBeInTheDocument();
    expect(screen.getByText('1h 0m 0s')).toBeInTheDocument();

    expect(screen.getByText('Start Time:')).toBeInTheDocument();
    expect(
      screen.getByText(
        new Date(mockBlockStatusData1.startTime).toLocaleString()
      )
    ).toBeInTheDocument();

    expect(screen.getByText('Retry After:')).toBeInTheDocument();
    expect(screen.getByText('30m 0s')).toBeInTheDocument();

    expect(screen.getByText('Attempt:')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
