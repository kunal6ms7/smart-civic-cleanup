import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, MapPin, Truck, Users } from "lucide-react";
import {
  addTruck,
  completeReportCollection,
  dispatchTruckToReport,
  onReportsUpdate,
  onTrucksUpdate,
  updateTruckLocation,
} from "./src/services/databaseService";

const NASHIK_CENTER = { lat: 19.9975, lng: 73.7898 };

export default function CommandCenter({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [reports, setReports] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [busyReportId, setBusyReportId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeReports = onReportsUpdate((nextReports) => {
      const sorted = [...nextReports].sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setReports(sorted);
    });

    const unsubscribeTrucks = onTrucksUpdate((nextTrucks) => {
      setTrucks(nextTrucks);
    });

    return () => {
      unsubscribeReports();
      unsubscribeTrucks();
    };
  }, []);

  const activeReports = reports.filter((report) => report.status !== "resolved");

  const ensureDispatchTruck = async () => {
    const availableTruck = trucks.find((truck) => truck.status === "available" || truck.status === "idle");
    if (availableTruck) return availableTruck;

    const result = await addTruck({
      registrationNumber: `MH15-${Date.now().toString().slice(-4)}`,
      driverName: "Nashik Dispatch Unit",
      driverId: "dispatch-system",
      status: "available",
      latitude: NASHIK_CENTER.lat,
      longitude: NASHIK_CENTER.lng,
    });

    return {
      id: result.truckId,
      truckId: result.truckId,
      driverName: "Nashik Dispatch Unit",
      latitude: NASHIK_CENTER.lat,
      longitude: NASHIK_CENTER.lng,
      status: "available",
    };
  };

  const moveTruckToReport = async (truckId: string, latitude: number, longitude: number) => {
    const currentTruck = trucks.find((truck) => truck.truckId === truckId || truck.id === truckId);
    const startLat = Number(currentTruck?.latitude || NASHIK_CENTER.lat);
    const startLng = Number(currentTruck?.longitude || NASHIK_CENTER.lng);

    for (let step = 1; step <= 6; step += 1) {
      const nextLat = startLat + ((latitude - startLat) * step) / 6;
      const nextLng = startLng + ((longitude - startLng) * step) / 6;
      await updateTruckLocation(truckId, nextLat, nextLng);
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
  };

  const handleDispatch = async (report: any) => {
    try {
      setBusyReportId(report.reportId || report.id);
      const truck = await ensureDispatchTruck();
      const truckId = truck.truckId || truck.id;
      const truckName = truck.driverName || truck.name || `Truck ${truckId}`;

      await dispatchTruckToReport(report.reportId || report.id, {
        truckId,
        truckName,
      });

      await moveTruckToReport(
        truckId,
        Number(report.latitude || NASHIK_CENTER.lat),
        Number(report.longitude || NASHIK_CENTER.lng)
      );
    } catch (error) {
      console.error("Dispatch failed:", error);
    } finally {
      setBusyReportId(null);
    }
  };

  const handleMarkDone = async (report: any) => {
    try {
      setBusyReportId(report.reportId || report.id);
      await completeReportCollection(report.reportId || report.id, report.assignedTruckId);
    } catch (error) {
      console.error("Failed to mark report done:", error);
    } finally {
      setBusyReportId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Staff Dashboard</h1>
            <p className="mt-2 text-base font-medium text-gray-600">
              Live complaint dispatch and garbage collection operations for Nashik.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#0288D1]">
            <MapPin className="h-4 w-4" />
            Nashik Active Zone
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
              <AlertTriangle className="h-4 w-4 text-[#D32F2F]" />
              Open Complaints
            </div>
            <div className="text-4xl font-black text-[#D32F2F]">{activeReports.length}</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
              <Truck className="h-4 w-4 text-[#0288D1]" />
              Fleet Units
            </div>
            <div className="text-4xl font-black text-[#0288D1]">{trucks.length}</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
              <Activity className="h-4 w-4 text-[#2E7D32]" />
              Active Trucks
            </div>
            <div className="text-4xl font-black text-[#2E7D32]">
              {trucks.filter((truck) => truck.status === "active").length}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
              <Users className="h-4 w-4 text-[#F59E0B]" />
              Resolved Today
            </div>
            <div className="text-4xl font-black text-[#F59E0B]">
              {reports.filter((report) => report.status === "resolved").length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Live Complaints</h2>
              <button
                onClick={() => onNavigate("tracktruck")}
                className="rounded-xl bg-[#0288D1] px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-white transition hover:bg-[#0277BD]"
              >
                Open Nashik Map
              </button>
            </div>

            <div className="space-y-4">
              {reports.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm font-medium text-gray-500">
                  No complaints available yet.
                </div>
              )}

              {reports.map((report) => {
                const reportId = report.reportId || report.id;
                const disabled = busyReportId === reportId;
                const severity =
                  report.severity === "critical"
                    ? "text-[#D32F2F]"
                    : report.severity === "high"
                      ? "text-[#D32F2F]"
                      : report.severity === "medium"
                        ? "text-[#F59E0B]"
                        : "text-[#2E7D32]";

                return (
                  <div key={reportId} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-lg font-extrabold tracking-tight text-gray-900">
                          {report.address || "Nashik Complaint"}
                        </div>
                        <div className="mt-1 text-sm font-medium text-gray-600">{report.description}</div>
                      </div>
                      <div className={`text-xs font-black uppercase tracking-widest ${severity}`}>
                        {report.severity || "low"} severity
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                      <span>Status: <span className="text-gray-900">{report.status || "pending"}</span></span>
                      <span>Points: <span className="text-gray-900">{report.awardedPoints || 0}</span></span>
                      {report.assignedTruckName && <span>Truck: <span className="text-[#0288D1]">{report.assignedTruckName}</span></span>}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => handleDispatch(report)}
                        disabled={disabled || report.status === "resolved"}
                        className="rounded-xl bg-[#0288D1] px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-white transition hover:bg-[#0277BD] disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {disabled ? "Dispatching..." : "Dispatch Truck"}
                      </button>
                      <button
                        onClick={() => handleMarkDone(report)}
                        disabled={disabled || report.status === "resolved"}
                        className="rounded-xl bg-[#2E7D32] px-4 py-3 text-xs font-extrabold uppercase tracking-widest text-white transition hover:bg-[#1B5E20] disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {report.status === "resolved" ? "Collected" : "Mark Done"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-extrabold tracking-tight text-gray-900">Truck Live Status</h2>
            <div className="space-y-4">
              {trucks.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm font-medium text-gray-500">
                  No trucks created yet. Dispatching a complaint will create a Nashik unit automatically.
                </div>
              )}

              {trucks.map((truck) => (
                <div key={truck.truckId || truck.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-extrabold text-gray-900">{truck.driverName || truck.name || truck.truckId}</div>
                    <div className="text-[11px] font-black uppercase tracking-widest text-[#0288D1]">
                      {truck.status || "available"}
                    </div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {Number(truck.latitude || NASHIK_CENTER.lat).toFixed(4)}, {Number(truck.longitude || NASHIK_CENTER.lng).toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
