import { cache } from "react";

import { apiFetch } from "@/lib/api-client";
import type {
  challengeOptions,
  challenges,
  courses,
  lessons,
  units,
  userProgress as userProgressTable,
  userSubscription as userSubscriptionTable,
} from "@/db/schema";

type Course = typeof courses.$inferSelect;
type Unit = typeof units.$inferSelect;
type Lesson = typeof lessons.$inferSelect;
type Challenge = typeof challenges.$inferSelect;
type ChallengeOption = typeof challengeOptions.$inferSelect;
type UserProgressRow = typeof userProgressTable.$inferSelect;
type UserSubscriptionRow = typeof userSubscriptionTable.$inferSelect;

export const getUserProgress = cache(async () => {
  return apiFetch<(UserProgressRow & { activeCourse: Course | null }) | null>("/user-progress");
});

export const getUnits = cache(async () => {
  return apiFetch<(Unit & { lessons: (Lesson & { completed: boolean })[] })[]>("/units");
});

export const getCourses = cache(async () => {
  return apiFetch<Course[]>("/courses");
});

export const getCourseById = cache(async (courseId: number) => {
  try {
    return await apiFetch<Course & { units: (Unit & { lessons: Lesson[] })[] }>(
      `/courses/${courseId}`,
    );
  } catch {
    return null;
  }
});

export const getCourseProgress = cache(async () => {
  return apiFetch<{
    activeLesson: (Lesson & { unit: Unit }) | null;
    activeLessonId: number | null;
  } | null>("/course-progress");
});

export const getLesson = cache(async (id?: number) => {
  const query = id ? `?id=${id}` : "";
  return apiFetch<
    (Lesson & {
      challenges: (Challenge & { completed: boolean; challengeOptions: ChallengeOption[] })[];
    }) | null
  >(`/lessons${query}`);
});

export const getLessonPercentage = cache(async () => {
  const data = await apiFetch<{ percentage: number }>("/lessons/percentage");
  return data.percentage;
});

export const getUserSubscription = cache(async () => {
  return apiFetch<(UserSubscriptionRow & { isActive: boolean }) | null>("/subscriptions/me");
});

export const getTopTenUsers = cache(async () => {
  return apiFetch<Pick<UserProgressRow, "userId" | "userName" | "userImageSrc" | "points">[]>(
    "/leaderboard",
  );
});
