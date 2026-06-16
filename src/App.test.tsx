import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

const itemsResponse = (ids: number[], lastId: number | null) =>
  ({
    ok: true,
    json: async () => ({ items: ids.map((id) => ({ id })), lastId }),
  }) as unknown as Response;

const firstPage = Array.from({ length: 20 }, (_, index) => index + 1);

describe('App', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue(itemsResponse(firstPage, 20));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /split screen/i })).toBeInTheDocument();
  });

  it('loads the first page of items into the available panel', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('available-item-1')).toBeInTheDocument());
    expect(screen.getByTestId('available-item-20')).toBeInTheDocument();
  });

  it('moves an item to the selected panel and back', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('available-item-5')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('available-item-5'));
    expect(screen.getByTestId('selected-item-5')).toBeInTheDocument();
    expect(screen.queryByTestId('available-item-5')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('selected-item-5'));
    expect(screen.getByTestId('available-item-5')).toBeInTheDocument();
    expect(screen.queryByTestId('selected-item-5')).not.toBeInTheDocument();
  });
});
