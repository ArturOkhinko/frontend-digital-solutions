import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

const jsonResponse = (body: unknown) =>
  ({ ok: true, json: async () => body }) as unknown as Response;

const availablePage = {
  items: Array.from({ length: 20 }, (_, index) => ({ id: index + 1 })),
  lastId: 20,
};

const emptyPage = { items: [], lastId: null };

const originalFetch = global.fetch;

describe('App', () => {
  beforeEach(() => {
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input);
      const body = url.includes('/selected') ? emptyPage : availablePage;
      return Promise.resolve(jsonResponse(body));
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /split screen/i })).toBeInTheDocument();
  });

  it('loads available items from the backend', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('available-item-1')).toBeInTheDocument());
    expect(screen.getByTestId('available-item-5')).toBeInTheDocument();
  });

  it('sends a select request when an available item is clicked', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('available-item-5')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('available-item-5'));

    await waitFor(
      () => {
        const selectCall = (global.fetch as jest.Mock).mock.calls.find(([input, init]) => {
          const body = (init as RequestInit | undefined)?.body;
          return (
            String(input).endsWith('/selected') &&
            (init as RequestInit | undefined)?.method === 'POST' &&
            typeof body === 'string' &&
            body.includes('5')
          );
        });
        expect(selectCall).toBeDefined();
      },
      { timeout: 2500 },
    );
  });
});
