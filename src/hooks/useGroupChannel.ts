"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getPusherClient, getPusherChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { toast } from "sonner";

interface UseGroupChannelOptions {
  groupId: string;
  enabled?: boolean;
}

export function useGroupChannel({ groupId, enabled = true }: UseGroupChannelOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled || !groupId) return;

    const pusher = getPusherClient();
    const channelName = getPusherChannel.group(groupId);
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // Expense created
    channel.bind(PUSHER_EVENTS.EXPENSE_CREATED, (data: { expense: { title: string }; triggeredBy: string }) => {
      toast.success(`New expense: ${data.expense.title}`, {
        description: "Group balances updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["expenses", groupId] });
      queryClient.invalidateQueries({ queryKey: ["balances", groupId] });
    });

    // Expense deleted
    channel.bind(PUSHER_EVENTS.EXPENSE_DELETED, () => {
      toast.info("An expense was removed.");
      queryClient.invalidateQueries({ queryKey: ["expenses", groupId] });
      queryClient.invalidateQueries({ queryKey: ["balances", groupId] });
    });

    // Settlement created
    channel.bind(PUSHER_EVENTS.SETTLEMENT_CREATED, (data: { payerName: string; receiverName: string; amount: number }) => {
      toast.success(`${data.payerName} settled with ${data.receiverName}`, {
        description: `₹${data.amount.toLocaleString()} paid.`,
      });
      queryClient.invalidateQueries({ queryKey: ["settlements", groupId] });
      queryClient.invalidateQueries({ queryKey: ["balances", groupId] });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [groupId, enabled, queryClient]);
}
