import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Thermometer, Gauge, Snowflake, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { EnergyAreaChart } from "@/components/home/EnergyChart";
import { deviceIcon, deviceTypeLabel } from "@/components/home/device-icons";
import { useState } from "react";
import { openBluetoothSettings, listPairedDevices, type BluetoothDevice } from "@/lib/home/bluetooth";
import { Bluetooth, RefreshCw, Unlink, Link2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useHome } from "@/lib/home/store";
import type { Device } from "@/lib/home/types";

export const Route = createFileRoute("/device/$deviceId")({
  component: DevicePage,
});

function makeSeries(base: number) {
  return Array.from({ length: 12 }, (_, i) => ({
    label: `${i * 2}h`,
    value: Math.max(0, Math.round(base * (0.5 + Math.sin(i / 2) * 0.3 + Math.random() * 0.2))),
  }));
}

function DevicePage() {
  const { deviceId } = Route.useParams();
  const { state, dispatch, canEdit, toggleDevice, toggleActivation } = useHome();
  const router = useRouter();
  const device = state.devices.find((d) => d.id === deviceId);
  const [isLinking, setIsLinking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);

  const handleRefreshDevices = async () => {
    setIsScanning(true);
    try {
      const devices = await scanBluetoothDevices();
      const paired = await listPairedDevices();
      // combine and deduplicate
      const all = [...paired, ...devices];
      const unique = Array.from(new Map(all.map(item => [item.address, item])).values());
      setPairedDevices(unique);
      setPairedDevices(devices);
      if (devices.length === 0) toast("No paired devices found. Pair in OS settings first.");
    } catch(e) {
      toast.error("Failed to load paired devices.");
    }
    setIsScanning(false);
  };


  if (!device) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-slate-900 dark:text-white bg-slate-50 dark:bg-black min-h-screen">
        <p>Device not found.</p>
        <Button asChild variant="link">
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const room = state.rooms.find((r) => r.id === device.roomId);
  const Icon = deviceIcon[device.type];
  const linked = state.automations.filter((a) => a.enabled);
  const patch = (p: Partial<Device>) =>
    dispatch({ type: "UPDATE_DEVICE", id: device.id, patch: p });

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen text-slate-900 dark:text-white pb-20 -mx-4 px-4 sm:-mx-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-8 pt-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.history.back()}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white dark:bg-[#111116] transition-colors hover:bg-[#181820]"
            aria-label="Back"
          >
            <ArrowLeft className="h-6 w-6 text-slate-900 dark:text-white" />
          </button>
          
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white dark:bg-[#111116]">
            <Icon className="h-6 w-6 text-neutral-300" />
          </div>
          
          <div className="flex-1 ml-2">
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 dark:text-white tracking-tight">{device.name}</h1>
            <p className="text-[15px] font-medium text-neutral-400">
              {deviceTypeLabel[device.type]} · {room?.name}
            </p>
          </div>

          {device.type !== "sensor" && (
            <div onClickCapture={() => toggleActivation(device.id)} className="ml-4">
              <Switch
                checked={device.activated ?? false}
                disabled={!canEdit}
                className="data-[state=checked]:bg-[#a855f7] data-[state=checked]:shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-125"
              />
            </div>
          )}
        </div>

        <div className="grid gap-6">
          <div className="space-y-6">
            {/* Controls */}
            <div className="space-y-5 rounded-[2rem] border border-white/5 bg-white dark:bg-[#111116] p-7 shadow-2xl">
              <h2 className="text-lg font-bold text-neutral-400">Controls</h2>

              {device.type === "light" && (
                <div className="space-y-8 mt-2">
                  <div className="flex justify-between items-center bg-[#181820] p-4 rounded-2xl border border-white/5">
                    <div className="font-semibold text-slate-900 dark:text-white">Master Switch</div>
                    <Button 
                      onClick={() => toggleDevice(device.id)}
                      disabled={!canEdit}
                      className={`h-12 px-8 rounded-xl font-bold transition-all ${
                        device.on 
                          ? "bg-purple-500 hover:bg-purple-600 text-slate-900 dark:text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
                          : "bg-[#2a2a35] hover:bg-[#353545] text-slate-900 dark:text-white"
                      }`}
                    >
                      {device.on ? "TURN OFF" : "TURN ON"}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-white">Brightness</p>
                      <p className="font-bold text-slate-900 dark:text-white text-lg">{device.brightness ?? 0}%</p>
                    </div>
                    <Slider
                      value={[device.brightness ?? 0]}
                      max={100}
                      step={1}
                      disabled={!device.on || !canEdit}
                      onValueChange={([v]) => patch({ brightness: v })}
                      trackClassName="h-3 bg-gradient-to-r from-[#181820] via-neutral-600 to-yellow-100"
                      rangeClassName="bg-transparent"
                      thumbClassName="h-6 w-6 border-[5px] border-[#111116] bg-white dark:bg-[#111116] shadow-xl"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <p className="font-semibold text-slate-900 dark:text-white">Tone</p>
                    <div className="flex gap-3">
                      {[
                        { label: "Warm", value: 2700, color: "bg-amber-500" },
                        { label: "Normal", value: 4000, color: "bg-[#f5f5f5]" },
                        { label: "Cool", value: 6500, color: "bg-blue-300" },
                      ].map((t) => (
                        <button
                          key={t.label}
                          disabled={!device.on || !canEdit}
                          onClick={() => patch({ colorTemp: t.value, color: undefined })}
                          className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all border ${
                            device.colorTemp === t.value && !device.color
                              ? "border-white bg-white dark:bg-[#111116]/10 shadow-lg" 
                              : "border-white/5 bg-[#181820] text-neutral-400 hover:bg-[#202028]"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full shadow-[0_0_10px_currentColor] ${t.color}`} />
                          <span className={device.colorTemp === t.value && !device.color ? "text-slate-900 dark:text-white" : ""}>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-white">RGB Color</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {[
                        "#ef4444", "#f97316", "#eab308", 
                        "#22c55e", "#0ea5e9", "#3b82f6", 
                        "#a855f7", "#ec4899"
                      ].map((c) => (
                        <button
                          key={c}
                          disabled={!device.on || !canEdit}
                          onClick={() => patch({ color: c })}
                          className={`w-12 h-12 rounded-full transition-all border-2 ${
                            device.color === c
                              ? "border-white scale-110 shadow-[0_0_15px_currentColor]" 
                              : "border-transparent scale-100 opacity-60 hover:opacity-100 hover:scale-105"
                          }`}
                          style={{ backgroundColor: c, color: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(device.type === "ac" || device.type === "fan") && (
                <div className="space-y-8 mt-2">
                  {device.type === "ac" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 dark:text-white">Temperature</p>
                        <p className="font-bold text-slate-900 dark:text-white text-lg">{device.temperature ?? 24}°C</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Snowflake className="h-6 w-6 text-blue-400" />
                        <Slider
                          value={[device.temperature ?? 24]}
                          min={16}
                          max={30}
                          step={1}
                          disabled={!device.on || !canEdit}
                          onValueChange={([v]) => patch({ temperature: v })}
                          trackClassName="h-3 bg-gradient-to-r from-blue-500 to-red-500"
                          rangeClassName="bg-transparent"
                          thumbClassName="h-6 w-6 border-[5px] border-[#111116] bg-white dark:bg-[#111116] shadow-xl"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <p className="font-semibold text-slate-900 dark:text-white">Fan speed</p>
                    <div className="flex gap-3">
                      {["Off", "Low", "Med", "High"].map((s, i) => (
                        <button
                          key={s}
                          disabled={!device.on || !canEdit}
                          onClick={() => patch({ fanSpeed: i })}
                          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                            (device.fanSpeed ?? 0) === i 
                              ? "bg-white dark:bg-[#111116] text-black shadow-lg" 
                              : "bg-white dark:bg-[#111116]/5 text-neutral-400 hover:bg-white dark:bg-[#111116]/10"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {device.type === "ac" && (
                    <div className="space-y-4">
                      <p className="font-semibold text-slate-900 dark:text-white">Mode</p>
                      <div className="flex gap-3">
                        {["Cool", "Heat", "Auto", "Dry"].map((m) => (
                          <button
                            key={m}
                            disabled={!device.on || !canEdit}
                            onClick={() => patch({ mode: m })}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                              device.mode === m 
                                ? "bg-white dark:bg-[#111116] text-black shadow-lg" 
                                : "bg-white dark:bg-[#111116]/5 text-neutral-400 hover:bg-white dark:bg-[#111116]/10"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {device.type === "plug" && (
                <div className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#111116]/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-purple-400" />
                    <span className="font-semibold text-neutral-300">Live draw</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {device.on ? device.watts : 0} W
                  </span>
                </div>
              )}

              {device.type === "wpt" && (
                <div className="space-y-8 mt-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-white">Power output</p>
                      <p className="font-bold text-slate-900 dark:text-white text-lg">{device.output ?? 0}%</p>
                    </div>
                    <Slider
                      value={[device.output ?? 0]}
                      max={100}
                      step={5}
                      disabled={!device.on || !canEdit}
                      onValueChange={([v]) => patch({ output: v, watts: Math.round(v * 5) })}
                      trackClassName="h-3 bg-gradient-to-r from-[#181820] to-[#a855f7]"
                      rangeClassName="bg-transparent"
                      thumbClassName="h-6 w-6 border-[5px] border-[#111116] bg-white dark:bg-[#111116] shadow-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`rounded-2xl border p-4 ${((device.thermal ?? 0) > 55) ? "border-red-500/30 bg-red-500/10" : "border-white/5 bg-white dark:bg-[#111116]/5"}`}>
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-2">
                        <Thermometer className="h-4 w-4" /> Thermal
                      </div>
                      <p className={`text-2xl font-bold ${((device.thermal ?? 0) > 55) ? "text-red-400" : "text-slate-900 dark:text-white"}`}>
                        {device.thermal ?? 0}°C
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white dark:bg-[#111116]/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-2">
                        <Gauge className="h-4 w-4" /> Connected
                      </div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">2 devices</p>
                    </div>
                  </div>
                </div>
              )}

              {device.type === "sensor" && (
                <div className="mt-4 rounded-2xl bg-white dark:bg-[#111116]/5 p-4 border border-white/5">
                  <p className="text-sm font-medium text-neutral-300">
                    Reporting normally · Connected to automation trigger
                  </p>
                </div>
              )}
            </div>

            {/* Energy graph */}
            <div className="rounded-[2rem] border border-white/5 bg-white dark:bg-[#111116] p-7 shadow-2xl">
              <h2 className="mb-6 text-lg font-bold text-neutral-400">Energy, last 24h</h2>
              <div className="-ml-2 -mr-4">
                <EnergyAreaChart data={makeSeries(device.watts || 10)} height={200} />
              </div>
            </div>
          </div>

          {/* Side info */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/5 bg-white dark:bg-[#111116] p-7 shadow-2xl space-y-5">
                            
                <div className="space-y-4 pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Bluetooth className="h-4 w-4 text-blue-400" /> Bluetooth Setup
                    </h3>
                  </div>
                  
                  {device.macAddress ? (
                    <div className="flex flex-col gap-3 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-200">Linked to MAC:</span>
                        <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{device.macAddress}</span>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full mt-2 font-bold"
                        onClick={() => {
                          patch({ macAddress: undefined });
                          toast.success("Device forgotten.");
                        }}
                      >
                        <Unlink className="h-4 w-4 mr-2" /> Reset Module
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 rounded-xl bg-orange-500/10 border border-orange-500/20 p-4">
                      <p className="text-sm text-orange-200 font-medium">No Bluetooth module linked.</p>
                      
                      {!isLinking ? (
                        <Button 
                          className="w-full bg-orange-500 hover:bg-orange-600 text-slate-900 dark:text-white font-bold"
                          onClick={() => {
                             setIsLinking(true);
                             handleRefreshDevices();
                          }}
                        >
                          <Link2 className="h-4 w-4 mr-2" /> Link Bluetooth Device
                        </Button>
                      ) : (
                        <div className="flex flex-col gap-3 pt-2">
                          <p className="text-xs text-neutral-400">1. Make sure your appliance is turned on.</p>
                          <Button variant="outline" size="sm" onClick={openBluetoothSettings} className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-medium">
                            Open Bluetooth Settings
                          </Button>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-neutral-400">2. Select your device from the scan list below.</p>
                            <Button variant="ghost" size="sm" onClick={handleRefreshDevices} disabled={isScanning} className="h-6 text-xs">
                              {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />} Refresh
                            </Button>
                          </div>
                          
                          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto rounded-lg border border-white/10 p-2 bg-black/50">
                            {pairedDevices.length === 0 ? (
                              <p className="text-xs text-center p-3 text-neutral-500">No paired devices found.</p>
                            ) : (
                              pairedDevices.map(d => (
                                <div 
                                  key={d.address}
                                  onClick={() => {
                                    patch({ macAddress: d.address });
                                    setIsLinking(false);
                                    toast.success(`Successfully linked ${d.name} (${d.address}) to ${device.name}!`);
                                  }}
                                  className="p-3 rounded-md cursor-pointer transition-colors bg-white dark:bg-[#111116]/5 hover:bg-white dark:bg-[#111116]/10"
                                >
                                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{d.name || "Unknown"}</div>
                                  <div className="text-xs text-neutral-400">{d.address}</div>
                                </div>
                              ))
                            )}
                          </div>
                          
                          <Button variant="ghost" size="sm" onClick={() => setIsLinking(false)} className="mt-2 text-neutral-400">Cancel</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              
              <h2 className="text-lg font-bold text-neutral-400">Details</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-neutral-400">Device ID</span>
                  <span className="text-[15px] font-bold text-slate-900 dark:text-white">{device.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-neutral-400">Room</span>
                  <span className="text-[15px] font-bold text-slate-900 dark:text-white">{room?.name ?? ", "}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-neutral-400">Connection</span>
                  <span className="flex items-center gap-2 text-[15px] font-bold text-slate-900 dark:text-white">
                    <span className={`h-2.5 w-2.5 rounded-full ${device.online ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"}`} />
                    {device.online ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-neutral-400">Live draw</span>
                  <span className="text-[15px] font-bold text-slate-900 dark:text-white">{device.on ? device.watts : 0} W</span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/5 bg-white dark:bg-[#111116] p-7 shadow-2xl space-y-5">
              <h2 className="text-lg font-bold text-neutral-400">Linked Automations</h2>
              {linked.length === 0 ? (
                <p className="text-[15px] font-medium text-neutral-500">None enabled.</p>
              ) : (
                <div className="space-y-4">
                  {linked.slice(0, 3).map((a) => (
                    <div key={a.id} className="flex items-center justify-between">
                      <span className="text-[15px] font-bold text-slate-900 dark:text-white">{a.name}</span>
                      <span className="rounded-full bg-white dark:bg-[#111116]/5 border border-white/5 px-4 py-1.5 text-xs font-semibold text-neutral-300 tracking-wide">
                        {a.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/5 bg-white dark:bg-[#111116] p-7 shadow-2xl space-y-5">
              <h2 className="text-lg font-bold text-neutral-400">Assigned Users</h2>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-[#a855f7] px-6 py-2 text-sm font-bold text-slate-900 dark:text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                  Owner
                </span>
                <span className="rounded-full bg-white dark:bg-[#111116]/10 px-6 py-2 text-sm font-bold text-slate-900 dark:text-white">
                  Family
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-12 mb-8">
          <Button 
            variant="destructive" 
            className="w-full max-w-sm font-bold bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-slate-900 dark:text-white"
            onClick={() => {
              if (confirm("Are you sure you want to delete this device? This action cannot be undone.")) {
                dispatch({ type: "REMOVE_DEVICE", id: device.id });
                router.navigate({ to: "/" });
                toast.success(`${device.name} deleted successfully.`);
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete Device completely
          </Button>
        </div>
      </div>
    </div>
  );
}
