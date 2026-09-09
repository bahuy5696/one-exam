import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the exam config screen', () => {
  render(<App />);
  const heading = screen.getByText(/AWS Solutions Architect Associate/i);
  expect(heading).toBeInTheDocument();
});
