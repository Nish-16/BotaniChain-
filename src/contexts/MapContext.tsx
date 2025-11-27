import { createContext } from "react";

export type FlyToFn = (lat: number, lon: number, zoom?: number) => void;

export const MapContext = createContext<{
  flyTo?: FlyToFn;
  setFlyTo?: (fn?: FlyToFn) => void;
}>({});

export default MapContext;
