import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeviceTile } from "@/components/home/DeviceTile";
import { useHome } from "@/lib/home/store";

export const Route = createFileRoute("/room/$roomId")({
  head: () => ({
    meta: [
      { title: "Room Control, ELLY Home" },
      { name: "description", content: "Control every device in this room in real time." },
    ],
  }),
  component: RoomPage,
  notFoundComponent: () => <p className="p-6">Room not found.</p>,
});

function RoomPage() {
  const { roomId } = Route.useParams();
  const { state } = useHome();
  const router = useRouter();
  const room = state.rooms.find((r) => r.id === roomId);
  const devices = state.devices.filter((d) => d.roomId === roomId);

  if (!room) {
    return (
      <div className="mx-auto max-w-5xl">
        <p>Room not found.</p>
        <Button asChild variant="link">
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const watts = devices.filter((d) => d.on).reduce((s, d) => s + d.watts, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
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
          <h1 className="text-2xl font-extrabold">{room.name}</h1>
          <p className="text-sm text-muted-foreground">
            {devices.filter((d) => d.on).length} of {devices.length} active · {watts} W in use
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {devices.map((d) => (
          <DeviceTile key={d.id} device={d} />
        ))}
      </div>
    </div>
  );
}
