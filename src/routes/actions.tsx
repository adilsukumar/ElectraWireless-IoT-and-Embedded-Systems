import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PlugZap,
  Power,
  Moon,
  ShieldCheck,
  Leaf,
  OctagonAlert,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";

export const Route = createFileRoute("/actions")({
  component: ActionsPage,
});

function ActionsPage() {
  const { dispatch, canEdit } = useHome();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Quick Actions</h1>
        <p className="text-sm text-muted-foreground">Trigger whole-home scenes instantly.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <QuickAction
          icon={Power}
          label="All Off"
          onClick={() => {
            dispatch({ type: "ALL_OFF" });
            toast.success("All non-critical devices off");
          }}
          disabled={!canEdit}
        />
        <QuickAction
          icon={Moon}
          label="Night Mode"
          onClick={() => {
            dispatch({ type: "NIGHT_MODE" });
            toast.success("Night Mode on");
          }}
          disabled={!canEdit}
        />
        <QuickAction
          icon={ShieldCheck}
          label="Away Mode"
          onClick={() => {
            dispatch({ type: "AWAY_MODE" });
            toast.success("Away Mode armed");
          }}
          disabled={!canEdit}
        />
        <QuickAction
          icon={Leaf}
          label="Energy Saver"
          onClick={() => {
            dispatch({ type: "ENERGY_SAVER" });
            toast.success("Energy Saver applied");
          }}
          disabled={!canEdit}
        />
      </div>
      
      <div className="pt-4">
        <EmergencyAction
          disabled={!canEdit}
          onConfirm={() => {
            dispatch({ type: "EMERGENCY" });
            toast.error("Emergency shutdown executed");
          }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Power;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card py-6 text-sm font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Icon className="h-6 w-6" />
      </span>
      {label}
    </button>
  );
}

function EmergencyAction({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          disabled={disabled}
          className="flex w-full flex-col items-center gap-3 rounded-3xl bg-destructive/10 py-6 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive text-destructive-foreground">
            <OctagonAlert className="h-6 w-6" />
          </span>
          Emergency Shutdown
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <PlugZap className="h-5 w-5 text-destructive" /> Emergency Shutdown?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This immediately cuts power to all non-critical devices (the refrigerator stays on).
            Safety overrides automation. Continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Shut down now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
