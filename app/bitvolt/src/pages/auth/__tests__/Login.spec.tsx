/* eslint-disable @typescript-eslint/no-non-null-assertion */
const useSearchParams = jest.fn().mockReturnValue([
  {
    get: () => 'knowhere',
  },
]);
const navigate = jest.fn();
const useNavigate = jest.fn().mockReturnValue(navigate);
const useAuthenticator = jest.fn();

jest.mock('react-router', () => ({
  useNavigate,
  useSearchParams,
}));
jest.mock('@aws-amplify/ui-react-core', () => ({
  useAuthenticator,
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Login from '../Login';

const submitForm = jest.fn();

describe('Login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render null when authStatus is configuring', () => {
    useAuthenticator.mockReturnValue({ authStatus: 'configuring' });
    const { container } = render(<Login />);

    expect(container.firstChild).toBeNull();
  });

  it('should redirect user when authenticated', () => {
    useAuthenticator.mockReturnValue({ authStatus: 'authenticated' });
    const { container } = render(<Login />);

    expect(container.firstChild).toBeNull();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('knowhere', { replace: true });
  });

  describe('Login form', () => {
    beforeEach(() => {
      useAuthenticator.mockReturnValue({ authStatus: 'unauthenticated', submitForm });
    });

    it('should correctly render form elements', () => {
      const { container } = render(<Login />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(container.querySelector('button[type="submit"')).not.toBeNull();
    });

    it('should show errors when submitted empty form', async () => {
      const { container } = render(<Login />);
      const button = container.querySelector('button[type="submit"')!;

      fireEvent.click(button);

      expect(await screen.findByText('Email is required')).toBeInTheDocument();
      expect(await screen.findByText('Password is required')).toBeInTheDocument();
    });

    it('should invoke onSubmit when submitted with valid input', async () => {
      const { container } = render(<Login />);
      const button = container.querySelector('button[type="submit"')!;
      const username = 'admin@localhost',
        password = 'password';

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: username },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: password },
      });
      fireEvent.click(button);

      await waitFor(() => {
        expect(submitForm).toHaveBeenCalledTimes(1);
        expect(submitForm).toHaveBeenCalledWith({ username, password });
      });
    });

    it('should disable submit button when pending is true', () => {
      useAuthenticator.mockReturnValue({ authStatus: 'unauthenticated', isPending: true });
      const { container } = render(<Login />);
      const button = container.querySelector('button[type="submit"')!;

      expect(button).toBeDisabled();
    });

    it('should show error when login failed', async () => {
      useAuthenticator.mockReturnValue({
        authStatus: 'unauthenticated',
        isPending: true,
        error: 'Login failed!',
      });
      render(<Login />);

      expect(await screen.findByText('Login failed!')).toBeInTheDocument();
    });
  });
});
