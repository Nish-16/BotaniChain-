type Tele = { temp: number; humidity: number; battery: number; signal: number };

export default function TelemetryPanel({ telemetry }: { telemetry: Tele }) {
  return (
    <div className="md:col-span-4 md:row-span-1">
      <div className="p-4 bg-white rounded-lg border border-slate-100">
        <h4 className="text-sm font-medium text-slate-700">Telemetry</h4>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600">
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <div className="text-xs text-slate-400">Temperature</div>
            <div className="font-medium">{telemetry.temp} °C</div>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <div className="text-xs text-slate-400">Humidity</div>
            <div className="font-medium">{telemetry.humidity} %</div>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <div className="text-xs text-slate-400">Battery</div>
            <div className="font-medium">{telemetry.battery} %</div>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <div className="text-xs text-slate-400">Signal</div>
            <div className="font-medium">{telemetry.signal} dBm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
