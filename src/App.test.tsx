import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /split screen/i })).toBeInTheDocument();
  });

  it('lists ids 0 to 20 in the available panel by default', () => {
    render(<App />);
    const available = screen.getByTestId('available-panel');
    expect(within(available).getByTestId('available-item-0')).toBeInTheDocument();
    expect(within(available).getByTestId('available-item-20')).toBeInTheDocument();
  });

  it('moves an item to the selected panel on click and back when clicked again', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('available-item-5'));
    expect(screen.getByTestId('selected-item-5')).toBeInTheDocument();
    expect(screen.queryByTestId('available-item-5')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('selected-item-5'));
    expect(screen.getByTestId('available-item-5')).toBeInTheDocument();
    expect(screen.queryByTestId('selected-item-5')).not.toBeInTheDocument();
  });
});
