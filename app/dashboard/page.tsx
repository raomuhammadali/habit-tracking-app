"use client";

import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HabitCard from "@/components/habit-card";
import AddHabitForm from "@/components/add-habit-form";

type Habit = { id: string; name: string; created_at: string };
type CheckIn = { habit_id: string; date: string };

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function calculateStreak(habitId: string, checkIns: CheckIn[]): number {
  const dates = checkIns
    .filter((c) => c.habit_id === habitId)
    .map((c) => c.date)
    .sort()
    .reverse();

  if (dates.length === 0) return 0;

  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const today = getToday();

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const [habitsRes, checkInsRes] = await Promise.all([
        supabase
          .from("habits")
          .select("id, name, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("check_ins")
          .select("habit_id, date")
          .eq("user_id", user.id),
      ]);

      setHabits(habitsRes.data ?? []);
      setCheckIns(checkInsRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">My Habits</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Log out
        </button>
      </div>

      <div className="mb-6">
        <AddHabitForm />
      </div>

      {habits.length === 0 ? (
        <p className="text-center text-sm text-gray-400">
          No habits yet. Add one above!
        </p>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              id={habit.id}
              name={habit.name}
              checkedIn={checkIns.some(
                (c) => c.habit_id === habit.id && c.date === today
              )}
              streak={calculateStreak(habit.id, checkIns)}
              today={today}
            />
          ))}
        </div>
      )}
    </div>
  );
}
