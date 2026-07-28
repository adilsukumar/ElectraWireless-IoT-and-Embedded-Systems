import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, DoorOpen } from "lucide-react";

import { useHome } from "@/lib/home/store";

export const Route = createFileRoute("/rooms")({
  component: RoomsPage,
});

function RoomsPage() {
  const { state } = useHome();

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen text-slate-900 dark:text-white pb-24 -mx-4 px-4 sm:-mx-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <Link
            to="/devices"
            className="p-2 bg-white/40 dark:bg-[#111116] rounded-full hover:bg-white/60 dark:bg-[#111116]/10 transition-colors border border-blue-200 dark:border-white/5"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight">Rooms</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {state.rooms.map((room) => (
            <Link
              key={room.id}
              to="/room/$roomId"
              params={{ roomId: room.id }}
              className="flex flex-col items-center justify-center gap-3 rounded-[2rem] border border-purple-200 dark:border-purple-500/25 bg-white/40 dark:bg-purple-950/30 backdrop-blur-md p-6 text-center text-sm font-semibold text-slate-900 dark:text-white transition-all hover:bg-white/60 dark:hover:bg-purple-900/40 hover:scale-[1.02] active:scale-95 shadow-sm group"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-[#111116]/10 text-slate-900 dark:text-white transition-transform group-hover:scale-110">
                <DoorOpen className="h-5 w-5" />
              </span>
              {room.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
