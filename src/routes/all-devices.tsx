import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeviceTile } from "@/components/home/DeviceTile";
import { useHome } from "@/lib/home/store";

export const Route = createFileRoute("/all-devices")({
  head: () => ({
    meta: [
      { title: "All Devices, ELLY Home" },
      { name: "description", content: "View and control all devices." },
    ],
  }),
  component: AllDevicesPage,
});

function AllDevicesPage() {
  const { state } = useHome();
  const router = useRouter();

  const activeCount = state.devices.filter((d) => d.on).length;

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
          <h1 className="text-2xl font-extrabold">All Devices</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} of {state.devices.length} active
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {state.devices.map((d) => (
          <DeviceTile key={d.id} device={d} />
        ))}
      </div>
    </div>
  );
}
