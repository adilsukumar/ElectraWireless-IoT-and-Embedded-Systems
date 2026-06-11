import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHome } from "@/lib/home/store";

export const Route = createFileRoute("/rooms")({
  component: RoomsPage,
});

function RoomsPage() {
  const { state } = useHome();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full">
          <Link to="/devices">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-extrabold text-primary">Rooms</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {state.rooms.map((room) => (
          <Link
            key={room.id}
            to="/room/$roomId"
            params={{ roomId: room.id }}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-4 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <DoorOpen className="h-6 w-6" />
            </span>
            {room.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
