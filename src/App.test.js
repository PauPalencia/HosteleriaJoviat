import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  process.env.REACT_APP_FIREBASE_PROJECT_ID = 'demo-project';
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ documents: [] })
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders app title', async () => {
  render(<App />);
  expect(await screen.findByText(/Hostelería Joviat/i)).toBeInTheDocument();
});
