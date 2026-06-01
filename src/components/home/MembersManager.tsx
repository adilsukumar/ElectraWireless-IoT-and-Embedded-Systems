import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  UserRound,
  ShieldCheck,
  DoorOpen,
  Cpu,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useHome } from "@/lib/home/store";
import type { AccessScope, Member } from "@/lib/home/types";

const emptyMember = (): Member => ({
  id: "",
  name: "",
  role: "family",
  scope: "rooms",
  roomIds: [],
  deviceIds: [],
  note: "",
});

function scopeSummary(
  m: Member,
  roomName: (id: string) => string,
  deviceName: (id: string) => string,
) {
  if (m.scope === "all") return "Full home access";
  if (m.scope === "rooms")
    return m.roomIds.length ? m.roomIds.map(roomName).join(", ") : "No rooms assigned";
  return m.deviceIds.length ? m.deviceIds.map(deviceName).join(", ") : "No devices assigned";
}

export function MembersManager() {
  const { state, dispatch } = useHome();
  const isOwner = state.role === "owner";

  const roomName = (id: string) => state.rooms.find((r) => r.id === id)?.name ?? id;
  const deviceName = (id: string) => state.devices.find((d) => d.id === id)?.name ?? id;

  const family = state.members.filter((m) => m.role === "family");
  const guests = state.members.filter((m) => m.role === "guest");

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Household Members</h2>
          <p className="text-sm text-muted-foreground">
            {isOwner
              ? "Manage who can control your home and what they can access."
              : "You can view members. Only the owner can add or edit access."}
          </p>
        </div>
        {isOwner && (
          <MemberDialog
            onSave={(m) => {
              dispatch({ type: "ADD_MEMBER", member: m });
              toast.success(`${m.name} added`);
            }}
          />
        )}
      </div>

      <MemberGroup
        title="Family Members"
        icon={Users}
        members={family}
        emptyText="No family members yet."
        isOwner={isOwner}
        roomName={roomName}
        deviceName={deviceName}
      />
      <MemberGroup
        title="Guests"
        icon={UserRound}
        members={guests}
        emptyText="No guests added."
        isOwner={isOwner}
        roomName={roomName}
        deviceName={deviceName}
      />
    </section>
  );
}

function MemberGroup({
  title,
  icon: Icon,
  members,
  emptyText,
  isOwner,
  roomName,
  deviceName,
}: {
  title: string;
  icon: typeof Users;
  members: Member[];
  emptyText: string;
  isOwner: boolean;
  roomName: (id: string) => string;
  deviceName: (id: string) => string;
}) {
  const { dispatch } = useHome();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Icon className="h-4 w-4" /> {title}
      </div>
      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold leading-tight">{m.name}</p>
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {m.role}
                    </Badge>
                  </div>
                  {m.note && <p className="mt-0.5 text-xs text-muted-foreground">{m.note}</p>}
                </div>
                {isOwner && (
                  <div className="flex shrink-0 gap-1">
                    <MemberDialog
                      initial={m}
                      trigger={
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          aria-label="Edit member"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                      onSave={(updated) => {
                        dispatch({ type: "UPDATE_MEMBER", id: m.id, patch: updated });
                        toast.success("Access updated");
                      }}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          aria-label="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove {m.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            They will lose all access to your home.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                              dispatch({ type: "REMOVE_MEMBER", id: m.id });
                              toast.success(`${m.name} removed`);
                            }}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-secondary/60 p-2.5 text-xs">
                <AccessIcon scope={m.scope} />
                <div>
                  <p className="font-medium">{accessLabel(m.scope)}</p>
                  <p className="text-muted-foreground">{scopeSummary(m, roomName, deviceName)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function accessLabel(scope: AccessScope) {
  if (scope === "all") return "Full access";
  if (scope === "rooms") return "Room-scoped access";
  return "Device-scoped access";
}

function AccessIcon({ scope }: { scope: AccessScope }) {
  const Icon = scope === "all" ? ShieldCheck : scope === "rooms" ? DoorOpen : Cpu;
  return <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />;
}

function MemberDialog({
  initial,
  trigger,
  onSave,
}: {
  initial?: Member;
  trigger?: React.ReactNode;
  onSave: (m: Member) => void;
}) {
  const { state } = useHome();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Member>(initial ?? emptyMember());

  const reset = () => setDraft(initial ?? emptyMember());

  const save = () => {
    if (!draft.name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    onSave({
      ...draft,
      id: draft.id || Math.random().toString(36).slice(2),
      name: draft.name.trim(),
    });
    setOpen(false);
  };

  const toggleRoom = (id: string) =>
    setDraft((d) => ({
      ...d,
      roomIds: d.roomIds.includes(id) ? d.roomIds.filter((x) => x !== id) : [...d.roomIds, id],
    }));
  const toggleDevice = (id: string) =>
    setDraft((d) => ({
      ...d,
      deviceIds: d.deviceIds.includes(id)
        ? d.deviceIds.filter((x) => x !== id)
        : [...d.deviceIds, id],
    }));

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" /> Add member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit member" : "Add member"}</DialogTitle>
          <DialogDescription>
            Set their name, role and exactly what they can control.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="m-name">Name</Label>
            <Input
              id="m-name"
              value={draft.name}
              placeholder="e.g. Alex Carter"
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={draft.role}
                onValueChange={(v) => setDraft((d) => ({ ...d, role: v as Member["role"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Access</Label>
              <Select
                value={draft.scope}
                onValueChange={(v) => setDraft((d) => ({ ...d, scope: v as AccessScope }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Full access</SelectItem>
                  <SelectItem value="rooms">Specific rooms</SelectItem>
                  <SelectItem value="devices">Specific devices</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {draft.scope === "rooms" && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <DoorOpen className="h-4 w-4" /> Rooms
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {state.rooms.map((r) => (
                  <label
                    key={r.id}
                    className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm"
                  >
                    <Checkbox
                      checked={draft.roomIds.includes(r.id)}
                      onCheckedChange={() => toggleRoom(r.id)}
                    />
                    {r.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {draft.scope === "devices" && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4" /> Devices
              </Label>
              <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2">
                {state.devices.map((dev) => (
                  <label
                    key={dev.id}
                    className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-secondary/60"
                  >
                    <Checkbox
                      checked={draft.deviceIds.includes(dev.id)}
                      onCheckedChange={() => toggleDevice(dev.id)}
                    />
                    <span className="flex-1">{dev.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {roomNameOf(state, dev.roomId)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {draft.scope === "all" && (
            <p className="flex items-center gap-2 rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" /> This member can control every device in the home.
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="m-note">Note (optional)</Label>
            <Input
              id="m-note"
              value={draft.note ?? ""}
              placeholder="e.g. Visiting until Sunday"
              onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{initial ? "Save changes" : "Add member"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function roomNameOf(state: ReturnType<typeof useHome>["state"], id: string) {
  return state.rooms.find((r) => r.id === id)?.name ?? id;
}
