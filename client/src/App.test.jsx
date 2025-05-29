import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ZigZaggo app', () => {
  render(<App />);
  const linkElement = screen.getByText(/ZigZaggo/i);
  expect(linkElement).toBeInTheDocument();
}); 