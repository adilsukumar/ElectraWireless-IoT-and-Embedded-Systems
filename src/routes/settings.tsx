import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Wifi, ShieldCheck, Server, Shield, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings, ELLY Home Automation" },
      { name: "description", content: "Roles & permissions, integration gateway, fallback routing and safety." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { state, dispatch } = useHome();

  return (
    <div className="bg-black flex-1 text-white pb-6 -mx-4 px-4 sm:-mx-8 sm:px-8 flex flex-col">
      <div className="mx-auto max-w-4xl w-full space-y-6 pt-2">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-white">Settings</h1>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/settings-users" className="flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-[#111116] border border-white/5 shadow-lg hover:bg-[#15151a] transition-all gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
              <Users className="h-5 w-5 text-[#a855f7]" strokeWidth={2} />
            </div>
            <span className="font-bold text-white text-xs">Users & Access</span>
          </Link>
          
          <Link to="/settings-network" className="flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-[#111116] border border-white/5 shadow-lg hover:bg-[#15151a] transition-all gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)] relative">
              <Wifi className="h-5 w-5 text-blue-500 relative -left-0.5" strokeWidth={2} />
              <div className="absolute -bottom-0.5 -right-0.5 bg-[#111116] rounded-full p-[1px]">
                <ShieldCheck className="h-3 w-3 text-blue-400" strokeWidth={2.5} />
              </div>
            </div>
            <span className="font-bold text-white text-xs">Network & Fallback</span>
          </Link>

          <Link to="/settings-gateways" className="flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-[#111116] border border-white/5 shadow-lg hover:bg-[#15151a] transition-all gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-400/10 border border-neutral-400/20 shadow-[0_0_10px_rgba(163,163,163,0.1)]">
              <Server className="h-5 w-5 text-neutral-400" strokeWidth={2} />
            </div>
            <span className="font-bold text-white text-xs">Gateways</span>
          </Link>

          <Link to="/settings-safety" className="flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-[#111116] border border-white/5 shadow-lg hover:bg-[#15151a] transition-all gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
              <Shield className="h-5 w-5 text-green-500" strokeWidth={2} />
            </div>
            <span className="font-bold text-white text-xs">Safety</span>
          </Link>
        </div>

        {/* Active Users */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-neutral-400 pl-2">Active Users</h2>
          <div className="rounded-2xl border border-white/5 bg-[#111116] overflow-hidden shadow-lg">
            {state.members.slice(0, 2).map((m, i) => {
              const isSarah = m.name.includes("Sarah");
              const roleDisplay = isSarah ? "Owner" : m.role === "family" ? "Family" : "Guest";
              const roleColor = roleDisplay === "Owner" 
                ? "bg-[#a855f7] text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
                : "bg-white/10 text-neutral-300";
              
              const initials = m.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

              return (
                <Dialog key={m.id}>
                  <DialogTrigger asChild>
                    <div className={`flex w-full items-center justify-between p-3.5 ${i !== 1 ? "border-b border-white/5" : ""} hover:bg-[#15151a] transition-colors cursor-pointer`}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c1c24] border border-white/10 font-bold text-white text-[11px] tracking-wider shadow-inner">
                          {initials}
                        </div>
                        <span className="font-bold text-white text-sm">{m.name}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${roleColor}`}>
                        {roleDisplay}
                      </span>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-[#111116] border border-white/10 text-white rounded-[2rem] sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Edit Member Access</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1c1c24] border border-white/10 font-bold text-white text-2xl tracking-widest shadow-inner">
                          {initials}
                        </div>
                        <h2 className="text-2xl font-bold">{m.name}</h2>
                        <span className={`px-5 py-1.5 rounded-full text-sm font-bold ${roleColor}`}>{roleDisplay}</span>
                      </div>
                      <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center"><span className="text-neutral-400 font-medium">Scope</span><span className="font-bold capitalize">{m.scope} devices</span></div>
                        <div className="flex justify-between items-center"><span className="text-neutral-400 font-medium">Notes</span><span className="font-bold">{m.note || "None"}</span></div>
                      </div>
                      <button className="w-full py-3 rounded-full border border-red-500/20 text-red-500 font-bold hover:bg-red-500/10 transition-all">Remove Member</button>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>

        {/* Emergency Power Cut */}
        <div className="pt-2">
          <button
            disabled={state.role === "guest"}
            onClick={() => {
              dispatch({ type: "EMERGENCY" });
              toast.error("Emergency power cut executed");
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50 text-xs tracking-wide"
          >
            <TriangleAlert className="h-4 w-4" strokeWidth={2.5} /> Emergency Power Cut
          </button>
        </div>

      </div>
    </div>
  );
}
