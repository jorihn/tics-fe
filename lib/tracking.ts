export const TRACKING_EVENTS = [
  "entered_start",
  "open_miniapp",
  "view_home",
  "click_view_plans",
  "view_agent_plans",
  "click_choose_plan",
  "click_pay",
  "payment_success",
  "payment_failed",
] as const;

export type TrackingEvent = (typeof TRACKING_EVENTS)[number];

export type TrackingPayload = Record<string, string | number | boolean | undefined>;

interface TrackingAdapter {
  track: (event: TrackingEvent, payload?: TrackingPayload) => void;
}

class ConsoleTrackingAdapter implements TrackingAdapter {
  track(event: TrackingEvent, payload?: TrackingPayload): void {
    // Pluggable point for Mixpanel/PostHog/etc.
    console.info("[track]", event, payload ?? {});
  }
}

const adapter: TrackingAdapter = new ConsoleTrackingAdapter();

export function trackEvent(event: TrackingEvent, payload?: TrackingPayload): void {
  adapter.track(event, payload);
}
