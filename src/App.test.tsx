import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /frontend/i })).toBeInTheDocument();
  });

  it('renders the intro paragraph', () => {
    render(<App />);
    expect(screen.getByText(/react \+ typescript \+ antd/i)).toBeInTheDocument();
  });
});
