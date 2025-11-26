// --- File: src/data/routeCheckpoints.ts ---
// Note: This file was not provided, but is necessary for the solution.

export const ROUTE_CHECKPOINTS = {
  // 1. Checkpoints for Patiala to Chandigarh (matching the map image)
  Patiala_Chandigarh: [
    {
      id: "rcp1",
      label: "Patiala Start",
      lat: 30.3398,
      lon: 76.3869,
      // Assuming 'reached' status is true for historical data
      reached: true, 
      timestamp: "2025-11-27 09:42", 
    },
    {
      id: "rcp2",
      label: "midway checkpoint",
      lat: 30.8000,
      lon: 76.8500,
      reached: true,
      timestamp: "2025-11-27 10:15",
    },
    {
      id: "rcp3",
      label: "Chandigarh End",
      lat: 30.7333,
      lon: 76.7794,
      reached: false, // Assuming destination is the final, sometimes pending point
      timestamp: undefined,
    },
  ],
  // 2. Sample Long Route
  Mumbai_Pune_Simulated: [
    { id: "rcp4", label: "Mumbai Exit", lat: 19.076, lon: 72.8777, reached: true, timestamp: "2025-12-01 08:00" },
    { id: "rcp5", label: "Lonavala", lat: 18.756, lon: 73.400, reached: false },
    { id: "rcp6", label: "Pune Arrival", lat: 18.5204, lon: 73.8567, reached: false },
  ],
  // 3. Interactive/Custom Mode
  Interactive: [],
};