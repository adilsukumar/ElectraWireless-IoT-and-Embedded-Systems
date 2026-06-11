import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHome } from "@/lib/home/store";
import { deviceIcon } from "@/components/home/device-icons";

export const Route = createFileRoute("/select-device")({
  head: () => ({
    meta: [
      { title: "Select Device, ELLY Home" },
      { name: "description", content: "Select a device to view its details." },
    ],
  }),
  component: SelectDevicePage,
});

function SelectDevicePage() {
  const { state } = useHome();
  const router = useRouter();

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
          <h1 className="text-2xl font-extrabold">Device Detail</h1>
          <p className="text-sm text-muted-foreground">Select a device to view or configure</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {state.devices.map((device) => {
          const Icon = deviceIcon[device.type];
          return (
            <Link
              key={device.id}
              to="/device/$deviceId"
              params={{ deviceId: device.id }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-4 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="h-6 w-6" />
              </span>
              {device.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
