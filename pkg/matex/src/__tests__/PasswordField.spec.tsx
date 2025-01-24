import { createEvent, fireEvent, render, screen } from '@testing-library/react';

import PasswordField from '../PasswordField';

describe('PasswordField', () => {
  it('should render without any props', async () => {
    render(<PasswordField label="password" />);

    const input = await screen.findByLabelText('password');
    expect(input.nodeName).toBe('INPUT');
  });

  it('should toggle password visibility on/off', async () => {
    const { container } = render(<PasswordField label="password" />);

    const input = await screen.findByLabelText('password');
    expect(input.getAttribute('type')).toBe('password');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const button = container.querySelector('.MuiIconButton-root')!;
    expect(button).not.toBeNull();

    fireEvent.click(button);
    expect(input.getAttribute('type')).toBe('text');
    expect(container.querySelector('svg[data-testid="VisibilityOffIcon"]')).not.toBeNull();
    expect(container.querySelector('svg[data-testid="VisibilityIcon"]')).toBeNull();

    fireEvent.click(button);
    expect(input.getAttribute('type')).toBe('password');
    expect(container.querySelector('svg[data-testid="VisibilityOffIcon"]')).toBeNull();
    expect(container.querySelector('svg[data-testid="VisibilityIcon"]')).not.toBeNull();
  });

  it('should prevent keep cursor at end of input', () => {
    const { container } = render(<PasswordField label="password" />);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const button = container.querySelector('.MuiIconButton-root')!;
    expect(button).not.toBeNull();

    const mouseDown = createEvent.mouseDown(button);
    fireEvent(button, mouseDown);
    expect(mouseDown.defaultPrevented).toBe(true);

    const mouseUp = createEvent.mouseUp(button);
    fireEvent(button, mouseUp);
    expect(mouseUp.defaultPrevented).toBe(true);
  });
});
