"use server";

import { revalidatePath } from "next/cache";

import { apiFetch } from "@/lib/api-client";

type Result = { error: "hearts" } | { ok: true; lessonId: number };

export const upsertChallengeProgress = async (challengeId: number) => {
  const result = await apiFetch<Result>(`/challenge-progress/${challengeId}`, {
    method: "POST",
  });

  if ("error" in result) {
    return result;
  }

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${result.lessonId}`);
};
