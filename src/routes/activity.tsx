import { createFileRoute } from "@tanstack/react-router";
import { useHome } from "@/lib/home/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity Log, ELLY Home" },
      { name: "description", content: "View recent events and voice commands." },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const { state } = useHome();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Activity Log</h1>
        <p className="text-sm text-muted-foreground">Recent events and system actions</p>
      </div>

      <div className="flex flex-col gap-2 rounded-3xl bg-card p-4 text-sm">
        {state.logs.length === 0 ? (
          <p className="text-muted-foreground">No recent activity.</p>
        ) : (
          state.logs.map((l) => (
            <div key={l.id} className="flex gap-3 py-1">
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{l.time}</span>
              <span
                className={cn(
                  l.source === "voice" && "text-primary font-medium",
                  l.source === "system" && "text-muted-foreground",
                )}
              >
                {l.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
