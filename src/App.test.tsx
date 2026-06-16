import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

const jsonResponse = (body: unknown) =>
  ({ ok: true, json: async () => body }) as unknown as Response;

const availablePage = {
  items: Array.from({ length: 20 }, (_, index) => ({ id: index + 1 })),
  lastId: 20,
};

const emptyPage = { items: [], lastId: null };

describe('App', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      const body = url.includes('/selected') ? emptyPage : availablePage;
      return Promise.resolve(jsonResponse(body));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /split screen/i })).toBeInTheDocument();
  });

  it('loads available items from the backend', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('available-item-1')).toBeInTheDocument());
    expect(screen.getByTestId('available-item-20')).toBeInTheDocument();
  });

  it('checks an item and reflects it in the action button count', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByTestId('available-item-5')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('available-item-5'));

    expect(screen.getByTestId('available-panel-action')).toHaveTextContent('Add to selected (1)');
  });
});
