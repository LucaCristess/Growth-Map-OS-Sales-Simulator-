declare module 'posthog-js' {
  interface PostHogConfig {
    api_host: string;
    capture_pageview: boolean;
    capture_pageleave: boolean;
  }

  const posthog: {
    init(apiKey: string, config?: PostHogConfig): void;
    capture(event: string, properties?: Record<string, unknown>): void;
    identify(distinctId: string, properties?: Record<string, unknown>): void;
    reset(): void;
  };

  export default posthog;
}
