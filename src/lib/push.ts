import * as webpush from "web-push";

import { createClient } from "@/lib/supabase/server";

type SubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export function isPushConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT,
  );
}

function configureWebPush() {
  if (!isPushConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  return true;
}

/** Send a push to one user. Silently no-ops if push is unconfigured or unsubscribed. */
export async function sendPushToUser(
  userId: string | null | undefined,
  title: string,
  body: string,
  url: string,
) {
  if (!userId || !configureWebPush()) return;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (error || !data?.length) return;

    const payload = JSON.stringify({
      title,
      body,
      url,
      icon: "/icons/icon-192.png",
    });

    await Promise.allSettled(
      (data as SubscriptionRow[]).map(async (row) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: row.endpoint,
              keys: { p256dh: row.p256dh, auth: row.auth },
            },
            payload,
          );
        } catch (sendError) {
          const status = (sendError as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) {
            // Device unsubscribed — remove the stale row.
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("user_id", userId)
              .eq("endpoint", row.endpoint);
          }
        }
      }),
    );
  } catch {
    // Notifications must never break the main flow.
  }
}
