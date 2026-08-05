export type Course = {
  id: number;
  title: string;
  imageSrc: string;
};

export type Lesson = {
  id: number;
  title: string;
  unitId: number;
  order: number;
};

export type LessonWithCompleted = Lesson & { completed: boolean };

export type Unit = {
  id: number;
  title: string;
  description: string;
  courseId: number;
  order: number;
  lessons: LessonWithCompleted[];
};

export type ChallengeOption = {
  id: number;
  challengeId: number;
  text: string;
  correct: boolean;
  imageSrc: string | null;
  audioSrc: string | null;
};

export type Challenge = {
  id: number;
  lessonId: number;
  type: "SELECT" | "ASSIST";
  question: string;
  order: number;
  completed: boolean;
  challengeOptions: ChallengeOption[];
};

export type LessonWithChallenges = Lesson & { challenges: Challenge[] };

export type UserProgress = {
  userId: string;
  userName: string;
  userImageSrc: string;
  activeCourseId: number | null;
  hearts: number;
  points: number;
  activeCourse: Course | null;
} | null;

export type CourseProgress = {
  activeLesson: (Lesson & { unit: Unit }) | null;
  activeLessonId: number | null;
} | null;

export type UserSubscription = {
  isActive: boolean;
} | null;

export type LeaderboardUser = {
  userId: string;
  userName: string;
  userImageSrc: string;
  points: number;
};

export type HeartsResult =
  | { error: "practice" | "subscription" | "hearts" }
  | { ok: true; lessonId: number };

export type ChallengeProgressResult = { error: "hearts" } | { ok: true; lessonId: number };
