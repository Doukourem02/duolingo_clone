"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { apiFetch } from "@/lib/api-client";

type HeartsResult =
  | { error: "practice" | "subscription" | "hearts" }
  | { ok: true; lessonId: number };

export const upsertUserProgress = async (courseId: number) => {
  await apiFetch("/user-progress", {
    method: "POST",
    body: JSON.stringify({ courseId }),
  });

  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

export const reduceHearts = async (challengeId: number) => {
  const result = await apiFetch<HeartsResult>("/user-progress/hearts/reduce", {
    method: "PATCH",
    body: JSON.stringify({ challengeId }),
  });

  if ("error" in result) {
    return result;
  }

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${result.lessonId}`);
};

export const refillHearts = async () => {
  await apiFetch("/user-progress/hearts/refill", { method: "PATCH" });

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};
