'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/lib/cart-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </ThemeProvider>
  );
}