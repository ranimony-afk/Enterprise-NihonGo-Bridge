/**
 * Unified Platform Schema (Domain Reorganized)
 * -----------------------
 * Powers BOTH brands (Ascend Academy + Nihongo Bridge) from ONE backend.
 * Reorganized into modular domain schema files to satisfy enterprise clean architecture.
 */

// 1. Users Domain
export {
  brands,
  users,
  accounts,
  sessions,
  verificationTokens,
} from "./schema/users";

// 2. Dictionary Domain
export {
  nihongoLearningItems,
  userWordLists,
} from "./schema/dictionary";

// 3. Kanji Domain
export {
  kanjiDictionary,
} from "./schema/kanji";

// 4. Grammar Domain
export {
  grammarRules,
} from "./schema/grammar";

// 5. Lessons Domain
export {
  lessons,
  conversationLessons,
} from "./schema/lessons";

// 6. Courses Domain
export {
  courses,
  modules,
  enrollments,
} from "./schema/courses";

// 7. Exams Domain
export {
  nihongoQuizzes,
  jlptExamSessions,
} from "./schema/exams";

// 8. Progress Domain
export {
  customDecks,
  customDeckCards,
  srsFlashcards,
  learnerGamification,
} from "./schema/progress";

// 9. Analytics Domain
export {
  leaderboards,
  auditLogs,
  downloadHistory,
} from "./schema/analytics";

// 10. CMS Domain
export {
  pages,
  contentSections,
  contentVersions,
  brandSettings,
  newsArticles,
  studyJapanItems,
  translations,
  translationMemory,
  translationWorkflows,
  editorialComments,
  editorialTasks,
  editorialCalendar,
  editorialNotifications,
  editorialEvents,
  subscribers,
  contacts,
  categories,
  tags,
  languages,
} from "./schema/cms";

// 11. Payments Domain
export {
  coupons,
  transactions,
} from "./schema/payments";

// 12. Media Domain
export {
  assetFolders,
  assetCollections,
  assets,
  assetVersions,
  assetUsages,
  downloadableResources,
} from "./schema/media";

// 13. Views & Materialized Views Domain
export {
  viewCourseLessons,
  viewUserProgress,
  viewMediaUsage,
  mvLeaderboardStandings,
} from "./schema/views";
