import { render, screen } from '@testing-library/react';

afterEach(() => {
  jest.restoreAllMocks();
  jest.resetModules();
});

test('renders sidebar title', async () => {
  process.env.REACT_APP_FIREBASE_PROJECT_ID = 'demo-project';

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ documents: [] })
  });

  const App = require('./App').default;

  render(<App />);
  expect(await screen.findByText(/JOVIAT/i)).toBeInTheDocument();
});
