import { and, eq } from "drizzle-orm";

import db from "../db/client";
import { challengeProgress, challenges, userProgress, userSubscription } from "../db/schema";
import { POINTS_TO_REFILL } from "../constants";
import { clerkClient } from "../lib/clerk";
import { stripe } from "../lib/stripe";
import { env } from "../env";
import { getCourseById, getUserProgress, getUserSubscription } from "./queries";

export class ServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const upsertUserProgress = async (userId: string, courseId: number) => {
  const course = await getCourseById(courseId);

  if (!course) {
    throw new ServiceError("Course not found", 404);
  }

  if (!course.units.length || !course.units[0].lessons.length) {
    throw new ServiceError("Course is empty", 400);
  }

  const user = await clerkClient.users.getUser(userId);
  const userName = user.firstName ?? "User";
  const userImageSrc = user.imageUrl ?? "/mascot.svg";

  const existingUserProgress = await getUserProgress(userId);

  if (existingUserProgress) {
    await db
      .update(userProgress)
      .set({
        activeCourseId: courseId,
        userName,
        userImageSrc,
      })
      .where(eq(userProgress.userId, userId));

    return;
  }

  await db.insert(userProgress).values({
    userId,
    activeCourseId: courseId,
    userName,
    userImageSrc,
  });
};

export const reduceHearts = async (userId: string, challengeId: number) => {
  const currentUserProgress = await getUserProgress(userId);
  const subscription = await getUserSubscription(userId);

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new ServiceError("Challenge not found", 404);
  }

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(eq(challengeProgress.userId, userId), eq(challengeProgress.challengeId, challengeId)),
  });

  const isPractice = !!existingChallengeProgress;

  if (isPractice) {
    return { error: "practice" as const };
  }

  if (!currentUserProgress) {
    throw new ServiceError("User progress not found", 404);
  }

  if (subscription?.isActive) {
    return { error: "subscription" as const };
  }

  if (currentUserProgress.hearts === 0) {
    return { error: "hearts" as const };
  }

  await db
    .update(userProgress)
    .set({
      hearts: Math.max(currentUserProgress.hearts - 1, 0),
    })
    .where(eq(userProgress.userId, userId));

  return { ok: true as const, lessonId: challenge.lessonId };
};

export const refillHearts = async (userId: string) => {
  const currentUserProgress = await getUserProgress(userId);

  if (!currentUserProgress) {
    throw new ServiceError("User progress not found", 404);
  }

  if (currentUserProgress.hearts === 5) {
    throw new ServiceError("Hearts are already full", 400);
  }

  if (currentUserProgress.points < POINTS_TO_REFILL) {
    throw new ServiceError("Not enough points", 400);
  }

  await db
    .update(userProgress)
    .set({
      hearts: 5,
      points: currentUserProgress.points - POINTS_TO_REFILL,
    })
    .where(eq(userProgress.userId, userId));
};

export const upsertChallengeProgress = async (userId: string, challengeId: number) => {
  const currentUserProgress = await getUserProgress(userId);
  const subscription = await getUserSubscription(userId);

  if (!currentUserProgress) {
    throw new ServiceError("User progress not found", 404);
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new ServiceError("Challenge not found", 404);
  }

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(eq(challengeProgress.userId, userId), eq(challengeProgress.challengeId, challengeId)),
  });

  const isPractice = !!existingChallengeProgress;

  if (currentUserProgress.hearts === 0 && !isPractice && !subscription?.isActive) {
    return { error: "hearts" as const };
  }

  if (isPractice) {
    await db
      .update(challengeProgress)
      .set({ completed: true })
      .where(eq(challengeProgress.id, existingChallengeProgress.id));

    await db
      .update(userProgress)
      .set({
        hearts: Math.min(currentUserProgress.hearts + 1, 5),
        points: currentUserProgress.points + 10,
      })
      .where(eq(userProgress.userId, userId));

    return { ok: true as const, lessonId: challenge.lessonId };
  }

  await db.insert(challengeProgress).values({
    challengeId,
    userId,
    completed: true,
  });

  await db
    .update(userProgress)
    .set({
      points: currentUserProgress.points + 10,
    })
    .where(eq(userProgress.userId, userId));

  return { ok: true as const, lessonId: challenge.lessonId };
};

export const createStripeCheckoutUrl = async (userId: string) => {
  const user = await clerkClient.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new ServiceError("User has no email address", 400);
  }

  const returnUrl = `${env.WEB_APP_URL}/shop`;
  const subscription = await getUserSubscription(userId);

  if (subscription?.stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return stripeSession.url;
  }

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "USD",
          product_data: {
            name: "Lingo Pro",
            description: "Unlimited Hearts",
          },
          unit_amount: 2000,
          recurring: {
            interval: "month",
          },
        },
      },
    ],
    metadata: {
      userId,
    },
    success_url: returnUrl,
    cancel_url: returnUrl,
  });

  if (!stripeSession.url) {
    throw new ServiceError("Failed to create Stripe session", 500);
  }

  return stripeSession.url;
};

export const handleStripeCheckoutCompleted = async (session: {
  subscription: string;
  metadata: { userId?: string } | null;
}) => {
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  if (!session.metadata?.userId) {
    throw new ServiceError("User ID is required", 400);
  }

  await db.insert(userSubscription).values({
    userId: session.metadata.userId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: subscription.items.data[0].price.id,
    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });
};

export const handleStripeInvoicePaymentSucceeded = async (session: { subscription: string }) => {
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  await db
    .update(userSubscription)
    .set({
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    })
    .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
};
