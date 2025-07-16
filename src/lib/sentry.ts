import * as Sentry from '@sentry/react';
import { Capacitor } from '@capacitor/core';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_APP_ENV || 'development';
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';

  if (!dsn) {
    // Only show warning in production
    if (environment === 'production') {
      console.warn('Sentry DSN not configured');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release: `chamahub@${version}`,
    integrations: [
      // Add integrations as needed
    ],
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: environment === 'production' ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Before sending errors, filter out noise
    beforeSend(event, hint) {
      // Filter out errors from browser extensions
      if (event.exception) {
        const values = event.exception.values || [];
        for (const exception of values) {
          if (exception.stacktrace) {
            const frames = exception.stacktrace.frames || [];
            for (const frame of frames) {
              if (frame.filename && (
                frame.filename.includes('extension://') ||
                frame.filename.includes('moz-extension://') ||
                frame.filename.includes('safari-extension://')
              )) {
                return null; // Don't send extension errors
              }
            }
          }
        }
      }

      // Filter out network errors in development
      if (environment === 'development' && event.exception) {
        const error = hint.originalException;
        if (error instanceof Error && error.message.includes('Network')) {
          return null;
        }
      }

      return event;
    },

    // Set user context
    initialScope: {
      tags: {
        platform: Capacitor.getPlatform(),
        native: Capacitor.isNativePlatform(),
      },
    },
  });
}

// Helper function to set user context
export function setSentryUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

// Helper function to clear user context
export function clearSentryUser() {
  Sentry.setUser(null);
}

// Helper function to capture custom events
export function captureEvent(message: string, level: 'info' | 'warning' | 'error' = 'info', extra?: any) {
  Sentry.addBreadcrumb({
    message,
    level,
    data: extra,
  });
}

// Helper function to capture performance metrics
export function capturePerformance(name: string, duration: number, tags?: Record<string, string>) {
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    level: 'info',
    data: {
      duration,
      ...tags,
    },
  });
}

// Error boundary component
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Wrap React Router for automatic route tracking
export const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter;
