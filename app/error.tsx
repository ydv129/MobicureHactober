/**
 * Global Error Boundary
 * Next.js Best Practice: Handle runtime errors gracefully
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 p-8 max-w-md">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold">Something went wrong!</h1>
            <p className="text-muted-foreground">
              An unexpected error has occurred. Please try again.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground font-mono">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <Button onClick={() => reset()}>
                Try again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Go home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
