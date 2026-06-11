import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.history.back()}
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold">Add New Room</h1>
          <p className="text-sm text-muted-foreground">Create a new space for your devices.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border bg-card p-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Room Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="e.g., Garage"
          />
        </div>

        <Button type="submit" className="w-full rounded-xl">
          Add Room
        </Button>
      </form>
    </div>
  );
}
