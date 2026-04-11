import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../Landing';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLanding() {
  return render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );
}

describe('Landing', () => {
  it('renders the heading and description', () => {
    renderLanding();
    expect(screen.getByRole('heading', { name: /squad health check/i })).toBeInTheDocument();
    expect(screen.getByText(/no sign-up required/i)).toBeInTheDocument();
  });

  it('navigates to /create when "Create New Session" is clicked', async () => {
    const user = userEvent.setup();
    renderLanding();
    await user.click(screen.getByRole('button', { name: /create new session/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/create');
  });

  it('disables Join button when input is empty', () => {
    renderLanding();
    const joinBtn = screen.getByRole('button', { name: /join session/i });
    expect(joinBtn).toBeDisabled();
  });

  it('navigates with session ID when joining', async () => {
    const user = userEvent.setup();
    renderLanding();
    const input = screen.getByPlaceholderText(/paste session link or id/i);
    await user.type(input, 'abc-123');
    await user.click(screen.getByRole('button', { name: /join session/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/session/abc-123');
  });

  it('extracts session ID from a full URL', async () => {
    const user = userEvent.setup();
    renderLanding();
    const input = screen.getByPlaceholderText(/paste session link or id/i);
    await user.type(input, 'https://example.com/#/session/deadbeef-1234');
    await user.click(screen.getByRole('button', { name: /join session/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/session/deadbeef-1234');
  });
});
