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
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold font-display">Remotes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Universal control for your smart appliances
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* LIVING ROOM TV */}
        <Link to="/tv-remote" className="flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-[2rem] bg-white dark:bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 group shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform">
            <Tv className="h-5 w-5" />
          </div>
          <p className="font-semibold text-white text-[15px] mt-1">TV</p>
        </Link>

        {/* SMART FRIDGE */}
        <Link to="/fridge-remote" className="flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-[2rem] bg-white dark:bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 group shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14b8a6] text-white shadow-[0_0_15px_rgba(20,184,166,0.3)] group-hover:scale-105 transition-transform">
            <Refrigerator className="h-5 w-5" />
          </div>
          <p className="font-semibold text-white text-[15px] mt-1">Fridge</p>
        </Link>

        {/* HOME AUDIO SYSTEM */}
        <Link to="/audio-remote" className="flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-[2rem] bg-white dark:bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 group shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316] text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:scale-105 transition-transform">
            <Volume2 className="h-5 w-5" />
          </div>
          <p className="font-semibold text-white text-[15px] mt-1">Audio</p>
        </Link>

        {/* GAME CONSOLE */}
        <Link to="/console-remote" className="flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-[2rem] bg-white dark:bg-[#111116] border border-white/5 transition-all hover:bg-[#181820] hover:scale-[1.02] active:scale-95 group shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <p className="font-semibold text-white text-[15px] mt-1">Console</p>
        </Link>

        {/* ADD REMOTE */}
        <button onClick={handleAddRemote} className="flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-[2rem] bg-white dark:bg-[#111116]/50 border-2 border-dashed border-white/10 transition-all hover:bg-[#181820] hover:border-white/20 hover:scale-[1.02] active:scale-95 group shadow-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-neutral-400 group-hover:text-white transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <p className="font-semibold text-neutral-400 group-hover:text-white text-[15px] mt-1 transition-colors">Add</p>
        </button>
      </div>
    </div>
  );
}
