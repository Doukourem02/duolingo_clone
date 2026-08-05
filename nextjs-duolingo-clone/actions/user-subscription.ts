"use server";

import { apiFetch } from "@/lib/api-client";

export const createStripeUrl = async () => {
  const result = await apiFetch<{ data: string }>("/subscriptions/checkout-url", {
    method: "POST",
  });

  return result;
};
