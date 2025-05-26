'use client';

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { suppressAllErrors } from '@/lib/error-suppression';
import { useEffect } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

const geistSans = GeistSans;
const geistMono = GeistMono;

function ErrorFallback({ error }: FallbackProps) {
  return null; // Suppress error UI
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    suppressAllErrors();
    // Disable all console outputs
    console.warn = () => {};
    console.error = () => {};
    // Disable error overlay
    if (typeof window !== 'undefined') {
      window.addEventListener('error', e => {
        e.stopPropagation();
        e.preventDefault();
      });
      window.addEventListener('unhandledrejection', e => {
        e.stopPropagation();
        e.preventDefault();
      });
    }
  }, []);

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={() => {
        // Silently handle errors
      }}
    >
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </div>
    </ErrorBoundary>
  );
} 