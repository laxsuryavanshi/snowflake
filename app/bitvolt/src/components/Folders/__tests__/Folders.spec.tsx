const list = jest.fn();
jest.mock('aws-amplify/storage', () => ({ list }));

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Folders from '../Folders';

describe('Folders', () => {
  beforeEach(() => {
    list.mockResolvedValue({ items: [] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render', () => {
    render(<Folders />);

    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('should show loading when fetching the list', async () => {
    render(<Folders />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should show error when failed to fetch list', async () => {
    list.mockRejectedValue('Failed to fetch ❌');

    render(<Folders />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch ❌')).toBeInTheDocument();
    });
  });

  it('should show empty folders message when list is empty', async () => {
    render(<Folders />);

    await waitFor(() => {
      expect(screen.getByText('No Folders Found')).toBeInTheDocument();
    });
  });

  it('should render received items from API', async () => {
    list.mockResolvedValue({
      items: [
        { key: 'Folder 1', size: 0 },
        { key: 'Folder 2', size: 0 },
        { key: 'Folder 3', size: 1 },
      ],
    });

    render(<Folders />);

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
  });

  it('should expand and collapse the folders', async () => {
    list.mockResolvedValue({
      items: [
        { key: 'Photos/', size: 0 },
        { key: 'Photos/Skiing/', size: 0 },
        { key: 'Photos/Trekking/', size: 0 },
        { key: 'Videos/', size: 0 },
      ],
    });

    const { container } = render(<Folders />);

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
      expect(container.querySelector('.MuiCollapse-entered')).toBeNull();
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const button = screen.getByText('Photos').closest('[role="button"]')!;
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(4);
      expect(container.querySelector('.MuiCollapse-entered')).toBeInTheDocument();
    });

    fireEvent.click(button);

    await waitFor(() => {
      // List items are not unmounted, instead just hidden
      expect(screen.getAllByRole('listitem')).toHaveLength(4);
      expect(container.querySelector('.MuiCollapse-entered')).toBeNull();
    });
  });
});
