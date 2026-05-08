"use client";

import { createHabit } from "@/app/actions";
import { useState } from "react";

export default function AddHabitForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await createHabit(formData);
    setName("");
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="flex gap-2">
      <input
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New habit..."
        required
        className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
