import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ListItemLink from '../ListItemLink';

describe('ListItemLink', () => {
  it('should render link with href', () => {
    render(
      <MemoryRouter>
        <ListItemLink href="/app">Application Home</ListItemLink>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /Application Home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/app');
  });

  it('should set selected prop when href matches current route', () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <ListItemLink href="/app">Application Home</ListItemLink>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /Application Home/i });
    expect(link).toHaveClass('Mui-selected');
  });

  it('should not set selected prop when href does not match current route', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <ListItemLink href="/app">Application Home</ListItemLink>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /Application Home/i });
    expect(link).not.toHaveClass('Mui-selected');
  });
});
