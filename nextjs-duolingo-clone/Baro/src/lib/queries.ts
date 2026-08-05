import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useApiClient } from "./api";
import type {
  ChallengeProgressResult,
  Course,
  CourseProgress,
  HeartsResult,
  LeaderboardUser,
  LessonWithChallenges,
  Unit,
  UserProgress,
  UserSubscription,
} from "./types";

export const useCourses = () => {
  const api = useApiClient();
  return useQuery({ queryKey: ["courses"], queryFn: () => api<Course[]>("/courses") });
};

export const useUserProgress = () => {
  const api = useApiClient();
  return useQuery({ queryKey: ["user-progress"], queryFn: () => api<UserProgress>("/user-progress") });
};

export const useUnits = () => {
  const api = useApiClient();
  return useQuery({ queryKey: ["units"], queryFn: () => api<Unit[]>("/units") });
};

export const useCourseProgress = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: ["course-progress"],
    queryFn: () => api<CourseProgress>("/course-progress"),
  });
};

export const useLessonPercentage = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: ["lesson-percentage"],
    queryFn: async () => (await api<{ percentage: number }>("/lessons/percentage")).percentage,
  });
};

export const useLesson = (id?: number) => {
  const api = useApiClient();
  return useQuery({
    queryKey: ["lesson", id ?? "active"],
    queryFn: () => api<LessonWithChallenges | null>(`/lessons${id ? `?id=${id}` : ""}`),
    enabled: id === undefined || Number.isFinite(id),
  });
};

export const useUserSubscription = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: ["user-subscription"],
    queryFn: () => api<UserSubscription>("/subscriptions/me"),
  });
};

export const useTopTenUsers = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => api<LeaderboardUser[]>("/leaderboard"),
  });
};

const useInvalidateProgress = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["user-progress"] });
    qc.invalidateQueries({ queryKey: ["units"] });
    qc.invalidateQueries({ queryKey: ["course-progress"] });
    qc.invalidateQueries({ queryKey: ["lesson-percentage"] });
  };
};

export const useSelectCourse = () => {
  const api = useApiClient();
  const invalidate = useInvalidateProgress();

  return useMutation({
    mutationFn: (courseId: number) =>
      api("/user-progress", { method: "POST", body: JSON.stringify({ courseId }) }),
    onSuccess: invalidate,
  });
};

export const useUpsertChallengeProgress = () => {
  const api = useApiClient();
  const invalidate = useInvalidateProgress();

  return useMutation({
    mutationFn: (challengeId: number) =>
      api<ChallengeProgressResult>(`/challenge-progress/${challengeId}`, { method: "POST" }),
    onSuccess: invalidate,
  });
};

export const useReduceHearts = () => {
  const api = useApiClient();
  const invalidate = useInvalidateProgress();

  return useMutation({
    mutationFn: (challengeId: number) =>
      api<HeartsResult>("/user-progress/hearts/reduce", {
        method: "PATCH",
        body: JSON.stringify({ challengeId }),
      }),
    onSuccess: invalidate,
  });
};

export const useRefillHearts = () => {
  const api = useApiClient();
  const invalidate = useInvalidateProgress();

  return useMutation({
    mutationFn: () => api("/user-progress/hearts/refill", { method: "PATCH" }),
    onSuccess: invalidate,
  });
};
