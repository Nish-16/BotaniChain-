// --- File: src/components/Checkpoints.tsx (MODIFIED) ---

// 1. Define the Checkpoint type
type Checkpoint = {
  id: string;
  label: string;
  reached?: boolean;
  timestamp?: string;
  lat?: number;
  lon?: number;
};

// 2. Define the props interface for the Checkpoints component
interface CheckpointsProps {
  checkpoints?: Checkpoint[];
  onSelect?: (lat: number, lon: number) => void;
}

// 3. REMOVED default checkpoint data (The agricultural list)

// 4. Checkpoints functional component
export default function Checkpoints({ checkpoints = [], onSelect }: CheckpointsProps) {
  return (
    <div style={{ padding: 12, borderRadius: 8, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', width: 300 }}>
      <h4 style={{ margin: '0 0 8px 0' }}>Route Checkpoints</h4> {/* Updated Title */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {checkpoints.length === 0 ? (
          <li style={{ color: '#6b7280', fontSize: 14 }}>No route checkpoints defined for this path.</li>
        ) : (
          checkpoints.map((c) => {
            // Determine if the list item should be clickable
            const clickable = typeof c.lat === 'number' && typeof c.lon === 'number' && typeof onSelect === 'function';
            // Default reached status to true if not explicitly set, common for past points
            const isReached = c.reached !== undefined ? c.reached : true;

            return (
              <li
                key={c.id}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'baseline',
                  marginBottom: 6,
                  cursor: clickable ? 'pointer' : 'default', // Apply pointer cursor if clickable
                }}
                // Handle click event only if clickable
                onClick={() => clickable && c.lat && c.lon && onSelect(c.lat, c.lon)}
                title={clickable ? 'Click to focus on map' : undefined}
              >
                {/* Status Indicator Dot */}
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: 9999,
                    background: isReached ? '#16a34a' : '#9ca3af', // Green if reached, gray otherwise
                  }}
                />
                {/* Checkpoint Details */}
                <div style={{ fontSize: 14, color: isReached ? '#111827' : '#6b7280' }}>
                  <div style={{ fontWeight: 600 }}>{c.label}</div>

                  {/* Display Lat/Lon if available */}
                  {c.lat !== undefined && c.lon !== undefined ? (
                    <div style={{ fontSize: 12, color: '#4b5563' }}>{`${c.lat.toFixed(4)}, ${c.lon.toFixed(4)}`}</div>
                  ) : null}

                  {/* Display Timestamp if reached and available */}
                  {isReached && c.timestamp ? (
                    <div style={{ fontSize: 12, color: '#4b5563' }}>{c.timestamp}</div>
                  ) : null}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}