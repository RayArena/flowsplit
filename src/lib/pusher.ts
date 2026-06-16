import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    );
  }
  return pusherClientInstance;
}

// Channel name helpers
export const getPusherChannel = {
  group: (groupId: string) => `group-${groupId}`,
  user: (userId: string) => `user-${userId}`,
};

// Event names
export const PUSHER_EVENTS = {
  EXPENSE_CREATED: "expense:created",
  EXPENSE_UPDATED: "expense:updated",
  EXPENSE_DELETED: "expense:deleted",
  SETTLEMENT_CREATED: "settlement:created",
  BALANCE_UPDATED: "balance:updated",
  MEMBER_JOINED: "member:joined",
  NOTIFICATION: "notification",
} as const;
