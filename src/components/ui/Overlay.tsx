import { Dashboard } from './Dashboard';
import { Controls } from './Controls';
import { PlayerTelemetry } from './PlayerTelemetry';

export const Overlay = () => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
      <Dashboard />
      <PlayerTelemetry />
      <Controls />
    </div>
  );
};
