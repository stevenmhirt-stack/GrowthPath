import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface SubscriptionResponse {
  subscriptionStatus: string;
  stripeCustomerId: string | null;
  subscriptionCurrentPeriodEnd: string | null;
}

export function useSubscription() {
  const { data, isLoading, error } = useQuery<SubscriptionResponse>({
    queryKey: ["/api/billing/subscription"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const subscriptionStatus = data?.subscriptionStatus || "free";
  const isPremium = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const currentPeriodEnd = data?.subscriptionCurrentPeriodEnd || null;
  const hasStripeCustomer = !!data?.stripeCustomerId;

  return {
    isPremium,
    subscriptionStatus,
    currentPeriodEnd,
    hasStripeCustomer,
    isLoading,
    error,
  };
}
