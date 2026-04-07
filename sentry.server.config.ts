import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 0.1,

  debug: false,
  environment: process.env.NODE_ENV || "development",

  beforeSend(event) {
    if (event.user) {
      delete event.user.ip_address;
    }
    return event;
  },
});
