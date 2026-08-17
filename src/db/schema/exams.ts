import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { brands, users } from "./users";

/* ------------------------------------------------------------------ */
/* Exams, Quizzes & JLPT Simulations                                  */
/* ------------------------------------------------------------------ */

export const nihongoQuizzes = pgTable(
  "nihongo_quizzes",
  {
    id: serial("id").primaryKey(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 64 }).notNull(),
    jlptLevel: varchar("jlpt_level", { length: 12 }).default("N5"),
    sectionType: varchar("section_type", { length: 32 }).default("vocabulary"),
    question: text("question").notNull(),
    options: jsonb("options").$type<string[]>().notNull(),
    correctIndex: integer("correct_index").notNull().default(0),
    explanation: text("explanation"),
    audioPrompt: text("audio_prompt"),
    timeLimitSeconds: integer("time_limit_seconds").default(60),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    quizCatIdx: index("nihongo_quizzes_cat_idx").on(t.category),
  }),
);

export const jlptExamSessions = pgTable(
  "jlpt_exam_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    jlptLevel: varchar("jlpt_level", { length: 12 }).notNull().default("N5"),
    totalScore: integer("total_score").notNull().default(0),
    maxScore: integer("max_score").notNull().default(180),
    passed: boolean("passed").notNull().default(false),
    vocabScore: integer("vocab_score").notNull().default(0),
    grammarScore: integer("grammar_score").notNull().default(0),
    readingScore: integer("reading_score").notNull().default(0),
    certificateCode: varchar("certificate_code", { length: 64 }),
    incorrectAnswers: jsonb("incorrect_answers").$type<Array<{ question: string; chosen: string; correct: string; explanation: string }>>().default([]),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    jlptCertIdx: index("jlpt_exam_cert_idx").on(t.certificateCode),
  }),
);
