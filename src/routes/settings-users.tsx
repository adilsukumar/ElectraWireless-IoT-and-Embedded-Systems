import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Users, UserRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/home/types";
import { MembersManager } from "@/components/home/MembersManager";

export const Route = createFileRoute("/settings-users")({
  component: SettingsUsersPage,
});

const roles: { id: Role; label: string; icon: typeof Crown; perms: string[] }[] = [
  { id: "owner", label: "Owner", icon: Crown, perms: ["Full control", "Add / remove devices", "Create automations"] },
  { id: "family", label: "Family Member", icon: Users, perms: ["Control devices", "Limited automation editing"] },
  { id: "guest", label: "Guest", icon: UserRound, perms: ["Restricted device control", "No automation editing"] },
];

function SettingsUsersPage() {
  const { state, dispatch } = useHome();

  return (
    <div className="bg-black flex-1 text-white pb-6 -mx-4 px-4 sm:-mx-8 sm:px-8 flex flex-col">
      <div className="mx-auto max-w-4xl w-full space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <Link to="/settings" className="p-2 bg-[#111116] rounded-full hover:bg-white/10 transition-colors border border-white/5">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight">Users & Access</h1>
        </div>
        <div className="grid gap-3 mt-4">
          {roles.map((r) => {
            const activeRole = state.role === r.id;
            return (
              <div key={r.id} className={cn("p-4 rounded-2xl border shadow-lg", activeRole ? "bg-[#15151a] border-[#a855f7]/50" : "bg-[#111116] border-white/5")}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="p-2.5 bg-[#a855f7]/10 rounded-xl border border-[#a855f7]/20">
                    <r.icon className="h-5 w-5 text-[#a855f7]" />
                  </div>
                  <p className="font-bold text-sm">{r.label}</p>
                  {activeRole && <span className="ml-auto px-3 py-1 bg-[#a855f7] text-white text-[10px] font-bold rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)] tracking-wide uppercase">Active</span>}
                </div>
                <ul className="mb-4 space-y-2 text-xs text-neutral-400 font-medium px-2">
                  {r.perms.map((p) => (
                    <li key={p} className="flex items-center gap-2">• {p}</li>
                  ))}
                </ul>
                <button
                  className={cn("w-full py-2.5 rounded-xl font-bold text-xs transition-all", activeRole ? "bg-white/5 text-neutral-400" : "bg-[#a855f7] text-white hover:bg-[#b065f8] shadow-[0_0_15px_rgba(168,85,247,0.3)]")}
                  disabled={activeRole}
                  onClick={() => {
                    dispatch({ type: "SET_ROLE", role: r.id });
                    toast.success(`Now acting as ${r.label}`);
                  }}
                >
                  {activeRole ? "Current role" : `Switch to ${r.label}`}
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 border-t border-white/5 pt-6">
          <MembersManager />
        </div>
      </div>
    </div>
  );
}
