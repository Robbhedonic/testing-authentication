import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GymDashboard from './GymDashboard';

describe('GymDashboard', () => {
  it('shows not logged in message when there is no user', () => {
    render(<GymDashboard user={null} />);

    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });

  it('shows the user name when logged in', () => {
    render(<GymDashboard user={{ name: 'Roberto' }} gyms={[]} />);

    expect(screen.getByText('Welcome, Roberto')).toBeInTheDocument();
  });

  it('hides the protected form when not logged in', () => {
    render(<GymDashboard user={null} gyms={[]} />);

    expect(screen.queryByRole('form', { name: 'add-gym-form' })).not.toBeInTheDocument();
  });

  it('shows a list of gyms when data is passed in', () => {
    render(
      <GymDashboard
        user={{ name: 'Roberto' }}
        gyms={[
          { id: 1, name: 'Iron Paradise' },
          { id: 2, name: 'Downtown Fitness' },
        ]}
      />
    );

    expect(screen.getByText('Iron Paradise')).toBeInTheDocument();
    expect(screen.getByText('Downtown Fitness')).toBeInTheDocument();
  });

  it('shows an error message when the gym list is empty', () => {
    render(<GymDashboard user={{ name: 'Roberto' }} gyms={[]} error="No gyms found" />);

    expect(screen.getByRole('alert')).toHaveTextContent('No gyms found');
  });
});
