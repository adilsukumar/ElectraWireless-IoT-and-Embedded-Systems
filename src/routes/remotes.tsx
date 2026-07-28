import { createFileRoute, Link } from "@tanstack/react-router";
import { Tv, Refrigerator, Volume2, Gamepad2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/remotes")({
  head: () => ({
    meta: [
      { title: "Universal Remotes, ELLY Home" },
      { name: "description", content: "Control your appliances from one place." },
    ],
  }),
  component: RemotesPage,
});

function RemotesPage() {
  const handleAddRemote = () => {
    toast.info("Add Remote feature coming soon!");
  };

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen text-slate-900 dark:text-white pb-24 -mx-4 px-4 sm:-mx-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6 pt-6">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Remotes</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 mt-1">
            Universal control for your smart appliances
          </p>
        </div>

      <div className="grid grid-cols-2 gap-4">
        {/* LIVING ROOM TV */}
        <Link to="/tv-remote" className="flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-[2rem] border border-purple-200 dark:border-purple-500/25 bg-white/40 dark:bg-purple-950/30 backdrop-blur-md transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 group shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b82f6] text-slate-900 dark:text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform">
            <Tv className="h-5 w-5" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-[15px] mt-1">TV</p>
        </Link>

        {/* SMART FRIDGE */}
        <Link to="/fridge-remote" className="flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-[2rem] border border-purple-200 dark:border-purple-500/25 bg-white/40 dark:bg-purple-950/30 backdrop-blur-md transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 group shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14b8a6] text-slate-900 dark:text-white shadow-[0_0_15px_rgba(20,184,166,0.3)] group-hover:scale-105 transition-transform">
            <Refrigerator className="h-5 w-5" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-[15px] mt-1">Fridge</p>
        </Link>

        {/* HOME AUDIO SYSTEM */}
        <Link to="/audio-remote" className="flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-[2rem] border border-purple-200 dark:border-purple-500/25 bg-white/40 dark:bg-purple-950/30 backdrop-blur-md transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 group shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316] text-slate-900 dark:text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:scale-105 transition-transform">
            <Volume2 className="h-5 w-5" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-[15px] mt-1">Audio</p>
        </Link>

        {/* GAME CONSOLE */}
        <Link to="/console-remote" className="flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-[2rem] border border-purple-200 dark:border-purple-500/25 bg-white/40 dark:bg-purple-950/30 backdrop-blur-md transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 group shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a855f7] text-slate-900 dark:text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <p className="font-semibold text-slate-900 dark:text-white text-[15px] mt-1">Console</p>
        </Link>

        {/* ADD REMOTE */}
        <button onClick={handleAddRemote} className="flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-[2rem] bg-white/30 dark:bg-purple-950/20 border-2 border-dashed border-purple-300 dark:border-purple-500/30 transition-all hover:bg-white/50 dark:hover:bg-purple-900/30 hover:border-purple-400 dark:hover:border-purple-400/50 hover:scale-[1.02] active:scale-95 group shadow-none backdrop-blur-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-[#111116]/10 text-slate-500 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <p className="font-semibold text-slate-500 dark:text-neutral-400 group-hover:text-slate-900 dark:group-hover:text-white text-[15px] mt-1 transition-colors">Add</p>
        </button>
      </div>
      </div>
    </div>
  );
}
