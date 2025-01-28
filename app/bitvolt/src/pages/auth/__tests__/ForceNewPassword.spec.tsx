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
import ForceNewPassword from '../ForceNewPassword';

const submitForm = jest.fn();

describe('ForceNewPassword', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render null when route is not forceNewPassword', () => {
    useAuthenticator.mockReturnValue({ route: 'signIn' });
    const { container } = render(<ForceNewPassword />);

    expect(container.firstChild).toBeNull();
  });

  it('should navigate user to next when authenticated', () => {
    useAuthenticator.mockReturnValue({ authStatus: 'authenticated', route: 'forceNewPassword' });
    render(<ForceNewPassword />);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('knowhere', { replace: true });
  });

  describe('ForceNewPassword form', () => {
    beforeEach(() => {
      useAuthenticator.mockReturnValue({ route: 'forceNewPassword', submitForm });
    });

    it('should correctly render form elements', () => {
      const { container } = render(<ForceNewPassword />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(container.querySelector('button[type="submit"')).not.toBeNull();
    });

    it('should show errors when submitted empty form', async () => {
      const { container } = render(<ForceNewPassword />);
      const button = container.querySelector('button[type="submit"')!;

      fireEvent.click(button);

      expect(await screen.findByText('Name is required')).toBeInTheDocument();
      expect((await screen.findAllByText('Password is required')).length).toBe(2);
    });

    it('should show error when new password and confirm password does not match', async () => {
      const { container } = render(<ForceNewPassword />);
      const button = container.querySelector('button[type="submit"')!;
      const name = 'Kyojuro Rengoku',
        newPassword = 'newPassword',
        confirmPassword = 'confirmPassword';

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: name },
      });
      fireEvent.change(screen.getByLabelText(/new password/i), {
        target: { value: newPassword },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: confirmPassword },
      });
      fireEvent.click(button);

      expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    });

    it('should invoke onSubmit when submitted with valid input', async () => {
      const { container } = render(<ForceNewPassword />);
      const button = container.querySelector('button[type="submit"')!;
      const name = 'Kyojuro Rengoku',
        newPassword = 'password',
        confirmPassword = 'password';

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: name },
      });
      fireEvent.change(screen.getByLabelText(/new password/i), {
        target: { value: newPassword },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: confirmPassword },
      });
      fireEvent.click(button);

      await waitFor(() => {
        expect(submitForm).toHaveBeenCalledTimes(1);
        expect(submitForm).toHaveBeenCalledWith({ name, password: newPassword });
      });
    });

    it('should disable submit button when pending is true', () => {
      useAuthenticator.mockReturnValue({ route: 'forceNewPassword', isPending: true });
      const { container } = render(<ForceNewPassword />);
      const button = container.querySelector('button[type="submit"')!;

      expect(button).toBeDisabled();
    });

    it('should show error when login failed', async () => {
      useAuthenticator.mockReturnValue({
        route: 'forceNewPassword',
        error: 'Password change failed!',
      });
      render(<ForceNewPassword />);

      expect(await screen.findByText('Password change failed!')).toBeInTheDocument();
    });
  });
});
