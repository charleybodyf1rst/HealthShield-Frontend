import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 0.1,

  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,

  debug: false,
  environment: process.env.NODE_ENV || "development",

  beforeSend(event) {
    if (event.user) {
      delete event.user.ip_address;
    }
    if (event.request?.url) {
      event.request.url = event.request.url.replace(/token=[^&]+/g, "token=REDACTED");
    }
    return event;
  },

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
