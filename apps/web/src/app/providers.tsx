// Wrap the app with React Query (so data fetching works cleanly)
// React Query manages server data (loading states, caching, errors). Added a provider that wraps the app once.

'use client'; // this needs 'use client' because it uses state. Layouts, for example, can stay server-side and just render the client provider.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}