import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

import * as schema from "../db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

type Vocab = {
  man: string;
  woman: string;
  robot: string;
};

type LanguageConfig = {
  courseTitle: string;
  vocab: Vocab;
};

const languages: LanguageConfig[] = [
  {
    courseTitle: "Italian",
    vocab: { man: "l'uomo", woman: "la donna", robot: "il robot" },
  },
  {
    courseTitle: "French",
    vocab: { man: "l'homme", woman: "la femme", robot: "le robot" },
  },
  {
    courseTitle: "Croatian",
    vocab: { man: "čovjek", woman: "žena", robot: "robot" },
  },
];

const main = async () => {
  try {
    console.log("Seeding additional languages");

    for (const lang of languages) {
      const course = await db.query.courses.findFirst({
        where: eq(schema.courses.title, lang.courseTitle),
      });

      if (!course) {
        console.log(`Skipping ${lang.courseTitle}: course not found`);
        continue;
      }

      const existingUnits = await db.query.units.findMany({
        where: eq(schema.units.courseId, course.id),
      });

      if (existingUnits.length > 0) {
        console.log(`Skipping ${lang.courseTitle}: already has content`);
        continue;
      }

      const [unit] = await db
        .insert(schema.units)
        .values({
          courseId: course.id,
          title: "Unit 1",
          description: `Learn the basics of ${lang.courseTitle}`,
          order: 1,
        })
        .returning();

      const [nounsLesson, verbsLesson] = await db
        .insert(schema.lessons)
        .values([
          { unitId: unit.id, title: "Nouns", order: 1 },
          { unitId: unit.id, title: "Verbs", order: 2 },
        ])
        .returning();

      const { man, woman, robot } = lang.vocab;

      const [c1, c2, c3] = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId: nounsLesson.id,
            type: "SELECT",
            order: 1,
            question: 'Which one of these is "the man"?',
          },
          {
            lessonId: nounsLesson.id,
            type: "ASSIST",
            order: 2,
            question: '"the man"',
          },
          {
            lessonId: nounsLesson.id,
            type: "SELECT",
            order: 3,
            question: 'Which one of these is "the robot"?',
          },
        ])
        .returning();

      await db.insert(schema.challengeOptions).values([
        { challengeId: c1.id, imageSrc: "/man.svg", correct: true, text: man },
        { challengeId: c1.id, imageSrc: "/woman.svg", correct: false, text: woman },
        { challengeId: c1.id, imageSrc: "/robot.svg", correct: false, text: robot },
      ]);

      await db.insert(schema.challengeOptions).values([
        { challengeId: c2.id, correct: true, text: man },
        { challengeId: c2.id, correct: false, text: woman },
        { challengeId: c2.id, correct: false, text: robot },
      ]);

      await db.insert(schema.challengeOptions).values([
        { challengeId: c3.id, imageSrc: "/man.svg", correct: false, text: man },
        { challengeId: c3.id, imageSrc: "/woman.svg", correct: false, text: woman },
        { challengeId: c3.id, imageSrc: "/robot.svg", correct: true, text: robot },
      ]);

      const [c4, c5, c6] = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId: verbsLesson.id,
            type: "SELECT",
            order: 1,
            question: 'Which one of these is "the woman"?',
          },
          {
            lessonId: verbsLesson.id,
            type: "ASSIST",
            order: 2,
            question: '"the woman"',
          },
          {
            lessonId: verbsLesson.id,
            type: "SELECT",
            order: 3,
            question: 'Which one of these is "the robot"?',
          },
        ])
        .returning();

      await db.insert(schema.challengeOptions).values([
        { challengeId: c4.id, imageSrc: "/woman.svg", correct: true, text: woman },
        { challengeId: c4.id, imageSrc: "/man.svg", correct: false, text: man },
        { challengeId: c4.id, imageSrc: "/robot.svg", correct: false, text: robot },
      ]);

      await db.insert(schema.challengeOptions).values([
        { challengeId: c5.id, correct: true, text: woman },
        { challengeId: c5.id, correct: false, text: man },
        { challengeId: c5.id, correct: false, text: robot },
      ]);

      await db.insert(schema.challengeOptions).values([
        { challengeId: c6.id, imageSrc: "/man.svg", correct: false, text: man },
        { challengeId: c6.id, imageSrc: "/woman.svg", correct: false, text: woman },
        { challengeId: c6.id, imageSrc: "/robot.svg", correct: true, text: robot },
      ]);

      console.log(`Seeded ${lang.courseTitle}`);
    }

    console.log("Done");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed additional languages");
  }
};

main().finally(() => pool.end());
