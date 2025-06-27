import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';

import Page from './+page.svelte';

describe('/+page.svelte', () => {
  test('should render form with email and password input', () => {
    render(Page, { form: {}, data: { providers: [] } });
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('should render hidden input fields', () => {
    render(Page, { form: {}, data: { providers: [] } });
    expect(screen.getByTestId('providerId')).toBeInTheDocument();
    expect(screen.getByTestId('redirectTo')).toBeInTheDocument();
  });

  test('should not render error alert', () => {
    render(Page, { form: {}, data: { providers: [] } });
    expect(screen.queryByRole('alert')).toBe(null);
  });

  test('should render error alert', () => {
    const message = 'Invalid email or password';
    render(Page, { form: { message }, data: { providers: [] } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert').innerHTML).includes(message);
  });
});
