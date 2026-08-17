import { pgView, pgMaterializedView } from "drizzle-orm/pg-core";
import { eq, desc } from "drizzle-orm";
import { users } from "./users";
import { lessons } from "./lessons";
import { modules, courses } from "./courses";
import { assets, assetFolders, assetCollections } from "./media";
import { learnerGamification } from "./progress";
import { leaderboards } from "./analytics";

/* ------------------------------------------------------------------ */
/* Views                                                              */
/* ------------------------------------------------------------------ */

export const viewCourseLessons = pgView("view_course_lessons").as((qb) =>
  qb
    .select({
      lessonId: lessons.id,
      lessonTitle: lessons.title,
      lessonSlug: lessons.slug,
      moduleTitle: modules.title,
      courseTitle: courses.title,
      courseSlug: courses.slug,
    })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
);

export const viewUserProgress = pgView("view_user_progress").as((qb) =>
  qb
    .select({
      userId: users.id,
      email: users.email,
      displayName: users.displayName,
      xp: learnerGamification.xp,
      streakDays: learnerGamification.streakDays,
      level: learnerGamification.level,
      levelTitle: learnerGamification.levelTitle,
    })
    .from(users)
    .leftJoin(learnerGamification, eq(users.id, learnerGamification.userId))
);

export const viewMediaUsage = pgView("view_media_usage").as((qb) =>
  qb
    .select({
      assetId: assets.id,
      url: assets.url,
      title: assets.title,
      folderName: assetFolders.name,
      collectionName: assetCollections.name,
    })
    .from(assets)
    .leftJoin(assetFolders, eq(assets.folderId, assetFolders.id))
    .leftJoin(assetCollections, eq(assets.collectionId, assetCollections.id))
);

/* ------------------------------------------------------------------ */
/* Materialized Views                                                 */
/* ------------------------------------------------------------------ */

export const mvLeaderboardStandings = pgMaterializedView("mv_leaderboard_standings").as((qb) =>
  qb
    .select({
      id: leaderboards.id,
      displayName: leaderboards.displayName,
      xp: leaderboards.xp,
      rank: leaderboards.rank,
      league: leaderboards.league,
      streakDays: leaderboards.streakDays,
    })
    .from(leaderboards)
    .orderBy(desc(leaderboards.xp))
);
