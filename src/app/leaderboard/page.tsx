import Link from "next/link";
import { db } from "@/db";
import { leaderboards, learnerGamification } from "@/db/schema";
import { asc } from "drizzle-orm";
import { ensureSeed } from "@/lib/seed";
import { BrandHeader } from "@/shared/components/BrandHeader";
import { getBrand } from "@/lib/brands";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  await ensureSeed();
  const cfg = getBrand("nihongo")!;

  const ranks = await db.select().from(leaderboards).orderBy(asc(leaderboards.rank));
  const gamifyRows = await db.select().from(learnerGamification).limit(1);
  const userStats = gamifyRows[0] ?? {
    xp: 420,
    streakDays: 8,
    dailyGoalMinutes: 15,
    weeklyGoalMinutes: 90,
    totalStudyMinutes: 135,
    completedLessonsCount: 14,
    completedReviewsCount: 95,
    averageTestScore: 92,
    streakFreezes: 2,
    level: 3,
    levelTitle: "Hiragana Adept",
    achievements: ["First 100 XP", "7-Day Streak Warrior", "Kanji Novice"],
    badges: [
      { name: "First 100 XP", icon: "⚡", description: "Earned your first 100 XP" },
      { name: "7-Day Streak", icon: "🔥", description: "Studied 7 days in a row" },
    ],
    dailyChallenges: [
      { title: "Review 10 flashcards in Spaced Repetition", xpReward: 20, isCompleted: true },
      { title: "Read today's Japanese news article", xpReward: 30, isCompleted: true },
    ],
    weakAreas: [
      { item: "食べる (taberu)", meaning: "To eat (Ichidan verb)", accuracy: 65 },
    ],
  };

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ background: cfg.theme.surface, color: cfg.theme.text }}
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <BrandHeader brand={cfg} />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: cfg.theme.primary }}>
              Duolingo-Style Leaderboard &amp; Gamification 🏆
            </h1>
            <p className="mt-1 text-sm opacity-80">
              Compete in the Sapphire League, track daily streaks, earn badges, and conquer your Japanese weak areas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">
              🧊 {userStats.streakFreezes} Streak Freezes
            </span>
          </div>
        </div>

        {/* Motivational Milestone Celebration Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-rose-500 to-amber-500 p-8 text-white shadow-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span>🎉 Milestone Celebration</span>
          </div>
          <h2 className="text-2xl font-bold">Incredible 8-Day Japanese Streak! 🔥</h2>
          <p className="text-sm opacity-90 max-w-xl">
            You're in the top 3% of learners this week. Keep up the daily momentum to promote to the Ruby League!
          </p>
        </div>

        {/* Dashboard Widgets Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-black/5 space-y-2">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">🎯 Today's Goal</p>
            <p className="text-2xl font-bold text-slate-950">{userStats.dailyGoalMinutes} / {userStats.dailyGoalMinutes} min</p>
            <p className="text-xs text-emerald-600 font-semibold">✓ Daily goal achieved!</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-black/5 space-y-2">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">⚡ Total XP &amp; Level</p>
            <p className="text-2xl font-bold text-slate-950">{userStats.xp} XP</p>
            <p className="text-xs text-indigo-700 font-semibold">Level {userStats.level} • {userStats.levelTitle}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-black/5 space-y-2">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">⏱ Total Study Time</p>
            <p className="text-2xl font-bold text-slate-950">{userStats.totalStudyMinutes} mins</p>
            <p className="text-xs text-slate-600 font-medium">{userStats.completedLessonsCount} lessons • {userStats.completedReviewsCount} reviews</p>
          </div>
        </div>

        {/* Sapphire League Leaderboard Table */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">Sapphire League Rankings 💎</h2>
            <span className="text-xs text-slate-500 font-medium">Resets Sunday at midnight</span>
          </div>

          <div className="divide-y divide-black/5">
            {ranks.map((r) => (
              <div
                key={r.id}
                className={`flex items-center justify-between py-3 px-2 rounded-xl transition ${
                  r.rank === 1 ? "bg-amber-50/70 font-bold" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center text-sm font-bold ${r.rank <= 3 ? "text-rose-600" : "opacity-50"}`}>
                    #{r.rank}
                  </span>
                  <span className="text-xl">{r.avatarEmoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{r.displayName}</p>
                    <p className="text-[11px] text-slate-500">🔥 {r.streakDays} day streak</p>
                  </div>
                </div>

                <span className="text-sm font-bold text-rose-700">{r.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Challenges & Weak Areas */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Daily Challenges */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-black/5 space-y-3">
            <h3 className="text-base font-bold text-slate-950">Daily Challenges 🎯</h3>
            <div className="space-y-2">
              {(userStats.dailyChallenges ?? []).map((ch, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                  <span className={ch.isCompleted ? "line-through opacity-60 text-slate-700" : "font-medium text-slate-900"}>
                    {ch.title}
                  </span>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 font-bold text-amber-900">
                    +{ch.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Areas (Identified difficult words) */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-black/5 space-y-3">
            <h3 className="text-base font-bold text-slate-950">Weak Areas to Practice 🧠</h3>
            <div className="space-y-2">
              {(userStats.weakAreas ?? []).map((w, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-rose-50 text-xs">
                  <div>
                    <p className="font-bold text-slate-950">{w.item}</p>
                    <p className="text-[11px] text-slate-600">{w.meaning}</p>
                  </div>
                  <Link
                    href="/study/flashcards"
                    className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-500"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
