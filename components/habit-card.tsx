"use client";

import { deleteHabit, toggleCheckIn } from "@/app/actions";
import { useState } from "react";

type HabitCardProps = {
  id: string;
  name: string;
  checkedIn: boolean;
  streak: number;
  today: string;
};

export default function HabitCard({
  id,
  name,
  checkedIn,
  streak,
  today,
}: HabitCardProps) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleToggle() {
    setToggling(true);
    await toggleCheckIn(id, today);
    setToggling(false);
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteHabit(id);
  }

  return (
    <div className="flex items-center justify-between rounded border border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          disabled={toggling}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 text-sm transition-colors hover:border-green-500 data-[checked=true]:border-green-500 data-[checked=true]:bg-green-500 data-[checked=true]:text-white"
          data-checked={checkedIn}
        >
          {checkedIn ? "✓" : ""}
        </button>
        <span className="text-sm font-medium">{name}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500">
          {streak > 0 ? `${streak} day streak` : "No streak"}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-400 hover:text-red-600"
        >
          {deleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
