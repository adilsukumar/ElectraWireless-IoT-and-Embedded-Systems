import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useHome } from "@/lib/home/store";
import type { Room } from "@/lib/home/types";
import { toast } from "sonner";

export const Route = createFileRoute("/add-room")({
  head: () => ({
    meta: [
      { title: "Add Room, ELLY Home" },
      { name: "description", content: "Create a new room in your home." },
    ],
  }),
  component: AddRoomPage,
});

function AddRoomPage() {
  const { dispatch } = useHome();
  const router = useRouter();

  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a room name.");
      return;
    }

    const newRoom: Room = {
      id: name.trim().toLowerCase().replace(/\s+/g, "-"),
      name: name.trim(),
    };

    dispatch({ type: "ADD_ROOM", room: newRoom });
    toast.success(`Room "${newRoom.name}" created successfully.`);
    router.navigate({ to: "/rooms" });
  };

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen text-slate-900 dark:text-white pb-24 -mx-4 px-4 sm:-mx-8 sm:px-8">
      <div className="mx-auto max-w-xl space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.history.back()}
            className="p-2 bg-white/40 dark:bg-[#111116] rounded-full hover:bg-white/60 dark:bg-[#111116]/10 transition-colors border border-blue-200 dark:border-white/5"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Add New Room</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">Create a new space for your devices.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-purple-200 dark:border-purple-500/25 bg-white/40 dark:bg-purple-950/30 backdrop-blur-md p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Room Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-blue-200 dark:border-white/10 bg-white/50 dark:bg-[#111116]/50 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="e.g., Garage"
            />
          </div>

          <button type="submit" className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            Add Room
          </button>
        </form>
      </div>
    </div>
  );
}
