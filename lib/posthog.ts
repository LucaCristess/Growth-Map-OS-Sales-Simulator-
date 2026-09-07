'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (key && host) {
    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
      capture_pageleave: true,
    });
  }
}

export function usePostHog() {
  useEffect(() => {
    // Identify session on mount if needed
  }, []);

  return {
    track: (event: string, properties?: Record<string, unknown>) => {
      if (typeof window !== 'undefined') {
        posthog.capture(event, properties);
      }
    },
    identify: (distinctId: string, properties?: Record<string, unknown>) => {
      if (typeof window !== 'undefined') {
        posthog.identify(distinctId, properties);
      }
    },
  };
}
