import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

type Props = {
  start: { lat: number; lon: number };
  dest: { lat: number; lon: number } | null;
  routeCoords: [number, number][];
};

export default function MapPanel({ start, dest, routeCoords }: Props) {
  return (
    <div className="md:col-span-1 md:row-span-1 h-full">
      {dest ? (
        <MapContainer
          center={[start.lat, start.lon]}
          zoom={10}
          className="w-full h-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[start.lat, start.lon]}>
            <Popup>Start</Popup>
          </Marker>
          <Marker position={[dest.lat, dest.lon]}>
            <Popup>Destination</Popup>
          </Marker>
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} color="#2563eb" weight={4} />
          )}
        </MapContainer>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          Loading map…
        </div>
      )}
    </div>
  );
}
