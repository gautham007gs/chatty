"use client";

import React from 'react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Example if needed

// const queryClient = new QueryClient(); // Example if needed

export function Providers({ children }: { children: React.ReactNode }) {
  // return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>; // Example
  return <>{children}</>;
}
